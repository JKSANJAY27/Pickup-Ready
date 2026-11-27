import { test } from 'node:test';
import assert from 'node:assert/strict';
import { openDb } from './db.js';
import { Desk } from './desk.js';
import { Agent } from './agent.js';

// Mock model: plays back a script of model turns. Each entry is a function of the request or a fixed content.
const call = (name, args) => ({ role: 'model', parts: [{ functionCall: { name, args } }] });
const say = (text) => ({ role: 'model', parts: [{ text }] });
const scripted = (...turns) => { let i = 0; return { generate: async () => turns[i++] }; };
const setup = (...turns) => { const d = new Desk(openDb(':memory:')); return { d, a: new Agent(d, scripted(...turns)) }; };

test('tool-only: order reserved after a natural-language confirmation, stock reduced by code', async () => {
  const { d, a } = setup(
    call('lookup_item', { term: 'sakkarai', qty: 5 }), call('propose_order', { lines: [{ product_id: 9, qty: 5 }] }), say('ஆர்டர் படிக்கிறேன். ஆமா சொல்லுங்க.'),
    call('confirm_order', { retailer_said: 'seri pannunga' }), say('பதிவு செய்தாச்சு.'));
  let r = await a.turn(1, '5 sakkarai venum');
  assert.equal(d.orders().length, 0);
  assert.equal(r.pending.total, 230);
  r = await a.turn(1, 'seri pannunga');
  assert.equal(r.order_id, 1);
  assert.equal(d.product(9).stock, 195);
  assert.ok(r.trace.some((t) => t.who === 'ai') && r.trace.some((t) => t.who === 'code'));
});

test('gate: confirm_order is refused in the same turn as the read-back (no reply from the retailer yet)', async () => {
  const { d, a } = setup(
    call('propose_order', { lines: [{ product_id: 9, qty: 5 }] }), call('confirm_order', { retailer_said: 'sari' }), say('சரி.'));
  const r = await a.turn(1, '5 sakkarai');
  assert.equal(d.orders().length, 0);
  assert.equal(d.product(9).stock, 200);
  assert.ok(r.trace.some((t) => /Refused: the retailer has not replied/.test(t.text)));
});

test('gate: confirm_order needs the confirming words and a pending order; reserve is impossible any other way', async () => {
  const { d, a } = setup(
    call('confirm_order', { retailer_said: 'sari' }), say('x'),
    call('propose_order', { lines: [{ product_id: 9, qty: 5 }] }), say('ok?'),
    call('confirm_order', {}), say('x'));
  let r = await a.turn(1, 'sari');
  assert.ok(r.trace.length === 1 || d.orders().length === 0);
  await a.turn(1, '5 sakkarai');
  r = await a.turn(1, 'hmm');                       // model calls confirm without any words
  assert.equal(d.orders().length, 0);
  assert.ok(r.trace.some((t) => /no confirming words/.test(t.text)));
  assert.equal(d.db.prepare('SELECT count(*) n FROM orders').get().n, 0);
});

// A tiny stand-in for the model's judgement, so the tests can show what the CODE does with each decision.
// (Whether the real model judges well is checked in live runs, not here.)
const AFFIRM = /(sari|seri|ok|okay|correct|yes|aama|ஆமா|சரி|pannunga|podunga)/i;
const judge = () => reactive((contents) => {
  const res = contents.at(-1).parts?.[0]?.functionResponse; // only a result from THIS round
  const said = lastUserText(contents) || '';
  if (res?.name === 'confirm_order') return say(res.response.status === 'reserved' ? 'பதிவு செய்தாச்சு. நன்றி.' : 'மறுபடியும் சொல்லுங்க.');
  if (res?.name === 'propose_order') return say('5 Sugar, 230 ரூபாய். சரியா?');
  if (/sakkarai/.test(said)) return call('propose_order', { lines: [{ product_id: 9, qty: 5 }] });
  if (AFFIRM.test(said) && !/hmm|maybe/i.test(said)) return call('confirm_order', { retailer_said: said });
  return say('தெளிவா சொல்லுங்க, ஆர்டர் போடவா?');   // unclear: ask again, never guess a yes
});

test('natural phrasing confirms: sari / ok / correct pannunga / Tamil script, no magic word', async () => {
  for (const phrase of ['sari', 'ok podunga', 'correct pannunga', 'சரி']) {
    const d = new Desk(openDb(':memory:')); const a = new Agent(d, judge());
    await a.turn(1, '5 sakkarai');
    const r = await a.turn(1, phrase);
    assert.equal(r.order_id, 1, phrase);
    assert.ok(r.trace.some((t) => /AI judged the retailer confirmed/.test(t.text)));
  }
});

test('ambiguous or absent affirmation: nothing reserved, the AI asks again', async () => {
  const d = new Desk(openDb(':memory:')); const a = new Agent(d, judge());
  await a.turn(1, '5 sakkarai');
  for (const phrase of ['hmm', 'maybe', 'enna rate']) {
    const r = await a.turn(1, phrase);
    assert.equal(r.order_id, null, phrase);
  }
  assert.equal(d.product(9).stock, 200);
});

test('end_call: the session ends, the pending order is not reserved, and the next call starts fresh', async () => {
  const d = new Desk(openDb(':memory:'));
  const a = new Agent(d, scripted(call('propose_order', { lines: [{ product_id: 9, qty: 1 }] }), say('ok?'), call('end_call', {}), say('வணக்கம்.'), say('hi')));
  await a.turn(1, '1 sakkarai');
  const r = await a.turn(1, 'bye');
  assert.equal(r.ended, true);
  assert.equal(d.orders().length, 0);
  assert.ok(r.trace.some((t) => /Call ended/.test(t.text)));
  assert.equal(a.sessions.has(1), false);
});

test('save_word needs a reply after the question, and the retailer\'s words', async () => {
  const { d, a } = setup(
    call('lookup_item', { term: 'vellai', qty: 1 }), call('save_word', { term: 'vellai', product_id: 9, retailer_said: 'sari' }), say('சரி.'),
    call('save_word', { term: 'vellai', product_id: 9, retailer_said: 'aama' }), say('சேமிச்சாச்சு.'));
  let r = await a.turn(1, 'vellai venum');          // asked in the same turn: refused
  assert.equal(d.memory().vocab.length, 0);
  assert.ok(r.trace.some((t) => /Refused: not saving/.test(t.text)));
  await a.turn(1, 'aama, sakkarai');                // retailer answered: saved
  assert.equal(d.memory().vocab.length, 1);
});

test('remember_brand still needs the product named', async () => {
  const { d, a } = setup(call('remember_brand', { category: 'oil', product_id: 2 }), say('சரி.'));
  await a.turn(1, 'vellai venum');
  assert.equal(d.memory().brands.length, 0);
});

test('stock is checked by code: out-of-stock line is rejected and logged as unmet demand', async () => {
  const { d, a } = setup(call('lookup_item', { term: 'urad dal', qty: 2 }), call('propose_order', { lines: [{ product_id: 7, qty: 2 }] }), say('இல்லை.'));
  const r = await a.turn(1, '2 urad dal');
  assert.equal(d.orders().length, 0);
  assert.ok(d.owner().unmet.some((u) => u.kind === 'out_of_stock'));
  assert.ok(r.trace.some((t) => /unavailable/.test(t.text)));
});

test('transcripts are recorded for both sides', async () => {
  const { d, a } = setup(say('வணக்கம்.'));
  await a.turn(2, 'hello');
  const t = a.transcripts();
  assert.deepEqual(t.map((x) => x.role), ['retailer', 'desk']);
});

test('server: without a key the call endpoint says key not set and the app still serves', async () => {
  const { createApp } = await import('./index.js');
  const srv = createApp(openDb(':memory:'), scripted(), () => false).listen(0);
  const port = srv.address().port;
  const base = `http://127.0.0.1:${port}`;
  const cfg = await (await fetch(`${base}/api/config`)).json();
  assert.equal(cfg.live_ai, false);
  const res = await fetch(`${base}/api/agent/turn`, { method: 'POST', body: JSON.stringify({ retailer_id: 1, text: 'hi' }) });
  assert.equal(res.status, 503);
  assert.equal((await fetch(`${base}/`)).status, 200);
  srv.close();
});

test('server: with a key, a turn goes through the agent and returns trace and sentences', async () => {
  const { createApp } = await import('./index.js');
  const llm = scripted(call('lookup_item', { term: 'uppu', qty: 1 }), say('உப்பு இருக்கு. எவ்வளவு வேணும்?'));
  const srv = createApp(openDb(':memory:'), llm, () => true).listen(0);
  const base = `http://127.0.0.1:${srv.address().port}`;
  const r = await (await fetch(`${base}/api/agent/turn`, { method: 'POST', body: JSON.stringify({ retailer_id: 1, text: 'uppu' }) })).json();
  assert.ok(r.sentences.length >= 1);
  assert.ok(r.trace.some((t) => t.who === 'code' && /Salt/.test(t.text)));
  srv.close();
});

// A mock model that reacts to the previous tool result, like a real model would.
const reactive = (fn) => ({ generate: async ({ contents, system }) => fn(contents, system) });
const lastResult = (contents) => { const m = [...contents].reverse().find((c) => c.parts?.some((p) => p.functionResponse)); return m?.parts[0].functionResponse; };
const lastUserText = (contents) => [...contents].reverse().find((c) => c.role === 'user' && c.parts[0].text)?.parts[0].text;

test('same as last time: reproduces the previous order lines from SQLite', async () => {
  const d = new Desk(openDb(':memory:'));
  const a = new Agent(d, scripted(
    call('propose_order', { lines: [{ product_id: 9, qty: 5 }, { product_id: 11, qty: 2 }] }), say('ஆமா?'), call('confirm_order', { retailer_said: 'seri pannunga' }), say('சரி.')));
  await a.turn(1, '5 sakkarai 2 tata tea'); await a.turn(1, 'aama');
  assert.equal(d.orders().length, 1);
  // second call: the model asks for the last order, then proposes exactly those lines
  const llm = reactive((contents) => {
    const res = lastResult(contents);
    if (!res) return call('get_last_order', {});
    if (res.name === 'get_last_order') return call('propose_order', { lines: res.response.lines.map((l) => ({ product_id: l.product_id, qty: l.qty })) });
    return say('கடந்த முறை மாதிரி. ஆமா?');
  });
  const a2 = new Agent(d, llm);
  const r = await a2.turn(1, 'same as last time');
  assert.equal(r.pending.total, 5 * 46 + 2 * 540);
  assert.ok(r.trace.some((t) => /Last order #1: 5 x Sugar 1kg, 2 x Tata Tea Gold 1kg/.test(t.text)));
});

test('last order is per retailer; new retailer has none', async () => {
  const d = new Desk(openDb(':memory:'));
  const a = new Agent(d, scripted(call('get_last_order', {}), say('இல்லை.')));
  const r = await a.turn(3, 'usual');
  assert.ok(r.trace.some((t) => /No earlier order/.test(t.text)));
});

test('caller context is bounded and includes recent orders and learned words', async () => {
  const d = new Desk(openDb(':memory:'));
  for (let i = 0; i < 6; i++) d.reserve({ retailerId: 1, items: [{ product: d.product(9), qty: 1 }], mode: 'x' });
  d.db.prepare('INSERT INTO vocab_memory VALUES (1,?,9)').run('vellai');
  let seen = '';
  const a = new Agent(d, reactive((c, system) => { seen = system; return say('வணக்கம்.'); }));
  await a.turn(1, 'hello');
  assert.match(seen, /Recent orders/);
  assert.equal((seen.match(/#\d+:/g) || []).length, 3); // last 3 only
  assert.match(seen, /"vellai" = Sugar 1kg/);
});

test('suggestions: unknown word gets only real in-stock catalogue rows', async () => {
  const d = new Desk(openDb(':memory:'));
  const s1 = d.suggest('toor dhal');
  assert.ok(s1.length >= 1 && s1[0].name === 'Toor Dal 1kg');
  assert.deepEqual(d.suggest('dragon fruit'), []);          // nothing close: no invention
  const names = new Set(d.products().map((p) => p.name));
  for (const q of ['urad dhal', 'tea powder', 'wheat maavu', 'xyz']) for (const x of d.suggest(q)) { assert.ok(names.has(x.name)); assert.ok(x.stock > 0); }
  // urad dal is out of stock, so it can never be suggested
  assert.ok(!d.suggest('urad dhal').some((x) => x.name === 'Urad Dal 1kg'));
});

test('agent offers a real alternative for a non-catalogue item', async () => {
  const d = new Desk(openDb(':memory:'));
  const llm = reactive((contents) => {
    const res = lastResult(contents);
    if (!res) return call('lookup_item', { term: 'toor dhal', qty: 2 });
    const first = res.response.suggestions?.[0];
    return say(first ? `${first.name} irukku. Venuma?` : 'Illa.');
  });
  const r = await new Agent(d, llm).turn(1, '2 toor dhal');
  assert.match(r.reply, /Toor Dal 1kg irukku/);
  assert.ok(r.trace.some((t) => /Closest in-stock catalogue items: Toor Dal 1kg/.test(t.text)));
  const none = await new Agent(d, reactive((c) => (lastResult(c) ? say(lastResult(c).response.suggestions.length ? 'x' : 'Illa.') : call('lookup_item', { term: 'dragon fruit' })))).turn(2, 'dragon fruit');
  assert.equal(none.reply, 'Illa.');
});

test('(scripted desk only) Tamil-script yes words count as yes (combining marks survive normalisation)', async () => {
  const { isYes } = await import('./interpreter.js');
  for (const w of ['ஆமா', 'ஆம்', 'சரி', 'ஆமா, சரிங்க']) assert.ok(isYes(w), w);
  assert.ok(!isYes('இல்ல'));
});
