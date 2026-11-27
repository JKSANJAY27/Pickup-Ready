const $ = (s) => document.querySelector(s);
const api = (p, o) => fetch(p, o && { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(o) }).then((r) => r.json());
let retailers = [];

document.querySelectorAll('nav button').forEach((b) => b.onclick = () => {
  document.querySelectorAll('nav button').forEach((x) => x.classList.toggle('on', x === b));
  ['call', 'packer', 'owner'].forEach((t) => $('#' + t).hidden = t !== b.dataset.tab);
  if (b.dataset.tab === 'packer') loadOrders();
});

async function init() {
  const cfg = await api('/api/config');
  $('#ai').textContent = cfg.live_ai ? 'Live AI on' : 'AI key not set: scripted sample, not live AI';
  retailers = (await api('/api/state')).retailers;
  $('#retailer').innerHTML = retailers.map((r) => `<option value="${r.id}">${r.name}, ${r.town}</option>`).join('');
}

function add(who, ta, en) {
  const d = document.createElement('div');
  d.className = 'msg ' + (who === 'me' ? 'me' : 'bot');
  d.innerHTML = en ? `${ta}<small>${en}</small>` : ta;
  $('#log').append(d); $('#log').scrollTop = 1e9;
}
async function send(text) {
  if (!text.trim()) return;
  add('me', text.replace(/</g, '&lt;'));
  const r = await api('/api/call/turn', { retailer_id: Number($('#retailer').value), text });
  add('bot', r.reply_ta, r.reply_en);
  $('#mode').textContent = r.mode === 'live_ai' ? 'Interpreted by live AI' : 'Scripted sample, not live AI';
  if (r.done && r.order_id) loadOrders();
}
$('#send').onclick = () => { const t = $('#text').value; $('#text').value = ''; send(t); };
$('#text').onkeydown = (e) => { if (e.key === 'Enter') $('#send').click(); };

const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
$('#mic').onclick = () => {
  if (!SR) return add('bot', 'Speech recognition is not available in this browser. Type instead.');
  const rec = new SR(); rec.lang = 'ta-IN';
  rec.onresult = (e) => send(e.results[0][0].transcript);
  rec.onerror = () => add('bot', 'Could not hear that. Please repeat, or type.');
  rec.start();
};

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
  $('#owner-table').innerHTML = `<table><tr><th>Item</th><th>Kind</th><th>Qty</th></tr>${o.unmet.map((u) => `<tr><td>${u.item}</td><td>${u.kind}</td><td>${u.qty}</td></tr>`).join('')}</table>`;
};
init();
