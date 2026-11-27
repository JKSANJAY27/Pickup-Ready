const $ = (s) => document.querySelector(s);
const api = (p, o) => fetch(p, o && { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(o) }).then((r) => r.json());
let retailers = [];

document.querySelectorAll('nav button').forEach((b) => b.onclick = () => {
  document.querySelectorAll('nav button').forEach((x) => x.classList.toggle('on', x === b));
  ['call', 'packer', 'owner'].forEach((t) => $('#' + t).hidden = t !== b.dataset.tab);
  if (b.dataset.tab === 'packer') loadOrders();
});

let cfg = { live_ai: false };
let calling = false, speaking = false, gen = 0, rec = null, tamilVoice = null;

async function init() {
  cfg = await api('/api/config');
  $('#ai').textContent = cfg.live_ai ? `Live AI on (${cfg.model})` : 'AI key not set';
  $('#keynote').hidden = cfg.live_ai;
  retailers = (await api('/api/state')).retailers;
  $('#retailer').innerHTML = retailers.map((r) => `<option value="${r.id}">${r.name}, ${r.town}</option>`).join('');
  pickVoice(); if (window.speechSynthesis) speechSynthesis.onvoiceschanged = pickVoice;
}
function pickVoice() {
  tamilVoice = (window.speechSynthesis?.getVoices() || []).find((v) => v.lang.toLowerCase().startsWith('ta')) || null;
  $('#voicenote').textContent = tamilVoice ? `Voice out: ${tamilVoice.name}` : 'No Tamil voice on this device: replies show as captions only';
}

function add(who, ta, en) {
  const d = document.createElement('div');
  d.className = 'msg ' + (who === 'me' ? 'me' : 'bot');
  d.innerHTML = en ? `${ta}<small>${en}</small>` : ta;
  $('#log').append(d); $('#log').scrollTop = 1e9;
}
const esc = (t) => String(t).replace(/</g, '&lt;');

async function send(text) {
  text = text.trim();
  if (!text) return;
  if (!cfg.live_ai) return add('bot', 'Key not set. Add GEMINI_API_KEY to enable the call.');
  stopSpeaking();
  const my = ++gen;
  add('me', esc(text));
  $('#status').textContent = 'Thinking...';
  let r;
  try {
    const res = await fetch('/api/agent/turn', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ retailer_id: Number($('#retailer').value), text }) });
    r = await res.json();
    if (!res.ok) { $('#status').textContent = ''; return add('bot', res.status === 503 ? 'Key not set.' : `AI error: ${esc(r.message || r.error)}`); }
  } catch { $('#status').textContent = ''; return add('bot', 'Could not reach the server.'); }
  if (my !== gen) return; // a newer turn started (interruption): drop this stale reply
  $('#status').textContent = '';
  add('bot', esc(r.reply));
  renderTrace(r.trace || []);
  loadMemory();
  if (r.order_id) loadOrders();
  speak(r.sentences, my);
}

// Voice out, sentence by sentence, with generation ids so an interruption drops the rest.
function speak(sentences, my) {
  if (!tamilVoice || !window.speechSynthesis) return;
  speaking = true; $('#status').textContent = 'Speaking...';
  if (!$('#headset').checked) rec?.abort?.();
  sentences.forEach((t, i) => {
    const u = new SpeechSynthesisUtterance(t);
    u.voice = tamilVoice; u.lang = tamilVoice.lang;
    u.onend = () => { if (my === gen && i === sentences.length - 1) { speaking = false; $('#status').textContent = calling ? 'Listening...' : ''; if (calling) listen(); } };
    speechSynthesis.speak(u);
  });
}
function stopSpeaking() { speaking = false; window.speechSynthesis?.cancel(); }

const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
function listen() {
  if (!SR || !calling) return;
  rec = new SR(); rec.lang = 'ta-IN'; rec.continuous = false; rec.interimResults = false;
  rec.onspeechstart = () => { if (speaking) { stopSpeaking(); gen++; $('#status').textContent = 'Interrupted, listening...'; } };
  rec.onresult = (e) => { send(e.results[0][0].transcript); };
  rec.onerror = (e) => { if (e.error !== 'no-speech' && e.error !== 'aborted') add('bot', 'Could not hear that. Please repeat, or type.'); };
  rec.onend = () => { if (calling && !speaking && $('#status').textContent !== 'Thinking...') setTimeout(listen, 200); };
  try { rec.start(); $('#status').textContent = 'Listening...'; } catch { /* already started */ }
}
$('#mic').onclick = () => {
  if (!SR) return add('bot', 'Speech recognition is not available in this browser. Use Chrome, or type.');
  calling = !calling;
  $('#mic').textContent = calling ? '⏹ End call' : '🎤 Start call (Tamil)';
  if (calling) listen(); else { rec?.abort?.(); stopSpeaking(); $('#status').textContent = ''; }
};
$('#send').onclick = () => { const t = $('#text').value; $('#text').value = ''; send(t); };
$('#text').onkeydown = (e) => { if (e.key === 'Enter') $('#send').click(); };
$('#transcript-btn').onclick = async () => {
  const t = await api('/api/transcripts');
  $('#transcript').textContent = t.length ? t.map((x) => `${x.retailer} | ${x.role}: ${x.text}`).join('\n') : 'No calls recorded yet.';
};

const LABEL = { ai: 'AI proposes', scripted: 'Scripted', code: 'Code decides', human: 'Retailer gate', learn: 'Learned' };
function renderTrace(steps) {
  if (!steps.length) return;
  const h = steps.map((t) => {
    const conf = t.confidence !== undefined ? ` <small>(confidence ${Math.round(t.confidence * 100)}%)</small>` : '';
    return `<div class="step"><span class="tag-${t.who}">${LABEL[t.who] || t.who}</span><span class="${t.unsure ? 'unsure' : ''}">${t.text.replace(/</g, '&lt;')}</span>${conf}</div>`;
  }).join('');
  $('#trace').innerHTML = h + ($('#trace').querySelector('.note') ? '' : '<hr>' + $('#trace').innerHTML);
}
async function loadMemory() {
  const m = await api('/api/memory');
  const rows = [...m.vocab.map((v) => `${v.retailer}: "${v.term}" means ${v.product}`), ...m.brands.map((b) => `${b.retailer}: ${b.category} is always ${b.product}`)];
  $('#memory').innerHTML = rows.length ? rows.map((r) => `<div class="step">${r.replace(/</g, '&lt;')}</div>`).join('') : '<p class="note">Nothing learned yet.</p>';
}
$('#reset').onclick = async () => { await api('/api/reset', {}); speechSynthesis.cancel(); $('#log').innerHTML = ''; $('#trace').innerHTML = '<p class="note">Steps appear here as you talk.</p>'; loadMemory(); loadOrders(); };
async function loadOrders() {
  const orders = await api('/api/orders');
  $('#orders').innerHTML = orders.length ? orders.map((o) => `<div class="order"><b>Order #${o.id}</b> ${o.retailer} · ${o.status} · code ${o.pickup_code}
    <ul>${o.lines.map((l) => `<li>${l.qty} x ${l.name}</li>`).join('')}</ul>
    ${o.status === 'reserved' ? `<div class="row"><input id="add${o.id}" placeholder="order ${o.id}-la 1 salt add pannunga"><button data-add="${o.id}">Add</button><button data-pack="${o.id}">Packing done, bill</button></div>` : ''}
    <pre id="bill${o.id}" hidden></pre></div>`).join('') : '<p>No orders yet. Place one on the Call tab.</p>';
  document.querySelectorAll('[data-add]').forEach((b) => b.onclick = async () => { await api(`/api/orders/${b.dataset.add}/add`, { text: $('#add' + b.dataset.add).value }); loadOrders(); });
  document.querySelectorAll('[data-pack]').forEach((b) => b.onclick = async () => { const r = await api(`/api/orders/${b.dataset.pack}/pack`, {}); await loadOrders(); const p = $('#bill' + b.dataset.pack); if (p && r.bill) { p.textContent = r.bill; p.hidden = false; } });
}
$('#ask').onclick = async () => {
  const o = await api('/api/owner');
  $('#answer').textContent = o.answer;
  $('#insights').innerHTML = o.insights.length ? o.insights.map((i) => `<div class="step">${i.text.replace(/</g, '&lt;')}</div>`).join('') : '<p class="note">No unmet demand to act on.</p>';
  $('#owner-table').innerHTML = `<table><tr><th>Item</th><th>Kind</th><th>Qty</th></tr>${o.unmet.map((u) => `<tr><td>${u.item}</td><td>${u.kind}</td><td>${u.qty}</td></tr>`).join('')}</table>`;
};
init().then(loadMemory);

async function loadRestock() {
  const st = await api('/api/state');
  $('#rs-product').innerHTML = st.products.map((p) => `<option value="${p.id}">${p.name} (stock ${p.stock})</option>`).join('');
  const ns = await api('/api/notifications');
  $('#notifs').innerHTML = ns.length ? ns.map((n) => `<div class="step"><span class="tag-code">To ${n.retailer.replace(/</g, '&lt;')}</span>${n.message.replace(/</g, '&lt;')}</div>`).join('') : '<p class="note">No back-in-stock messages sent yet.</p>';
}
$('#rs-go').onclick = async () => { await api('/api/restock', { product_id: Number($('#rs-product').value), qty: Number($('#rs-qty').value) }); loadRestock(); };
document.querySelector('[data-tab="owner"]').addEventListener('click', loadRestock);

// Path B: Gemini Live speech-to-speech. The server relays audio; tool calls run through the same gates.
let liveOn = false, liveBubble = { me: null, bot: null };
$('#live').onclick = async () => {
  if (liveOn) { await stopLive(); liveOn = false; $('#live').textContent = '🎙 Live voice call (speech-to-speech)'; $('#status').textContent = ''; return; }
  if (!cfg.live_ai) { $('#keynote').hidden = false; return; }
  try {
    $('#status').textContent = 'connecting...';
    await startLive(Number($('#retailer').value), (ev) => {
      if (ev.type === 'ready') $('#status').textContent = 'live: speak now';
      if (ev.type === 'retailer_text' || ev.type === 'desk_text') {
        const k = ev.type === 'retailer_text' ? 'me' : 'bot';
        if (!liveBubble[k] || !liveBubble[k].isConnected) { add(k, ''); liveBubble[k] = $('#log').lastChild; }
        liveBubble[k].textContent = ev.text; $('#log').scrollTop = 1e9;
      }
      if (ev.type === 'turn_complete') liveBubble = { me: null, bot: null };
      if (ev.type === 'trace') renderTrace(ev.trace);
      if (ev.type === 'error' || ev.type === 'closed') $('#status').textContent = ev.message || 'call ended';
    });
    liveOn = true; $('#live').textContent = '⏹ End live call';
  } catch (e) { $('#status').textContent = String(e.message || e); await stopLive(); }
};
