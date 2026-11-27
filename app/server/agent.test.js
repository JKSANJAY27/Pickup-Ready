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

test('tool-only: order reserved after aama, stock reduced by code', async () => {
  const { d, a } = setup(
    call('lookup_item', { term: 'sakkarai', qty: 5 }), call('propose_order', { lines: [{ product_id: 9, qty: 5 }] }), say('ஆர்டர் படிக்கிறேன். ஆமா சொல்லுங்க.'),
    call('confirm_order', {}), say('பதிவு செய்தாச்சு.'));
  let r = await a.turn(1, '5 sakkarai venum');
  assert.equal(d.orders().length, 0);
  assert.equal(r.pending.total, 230);
  r = await a.turn(1, 'aama');
  assert.equal(r.order_id, 1);
  assert.equal(d.product(9).stock, 195);
  assert.ok(r.trace.some((t) => t.who === 'ai') && r.trace.some((t) => t.who === 'code'));
});

test('gate: confirm_order is refused unless the latest message is a yes', async () => {
  const { d, a } = setup(
    call('propose_order', { lines: [{ product_id: 9, qty: 5 }] }), say('ஆமா?'),
    call('confirm_order', {}), say('சரி.'));   // model tries to confirm although the retailer said something else
  await a.turn(1, '5 sakkarai');
  const r = await a.turn(1, 'enna rate');
  assert.equal(d.orders().length, 0);
  assert.equal(d.product(9).stock, 200);
  assert.ok(r.trace.some((t) => /Refused/.test(t.text)));
});

test('gate: one aama cannot both save a word and confirm an order', async () => {
  const { d, a } = setup(
    call('propose_order', { lines: [{ product_id: 9, qty: 1 }] }), say('ஆமா?'),
    call('save_word', { term: 'vellai', product_id: 9 }), call('confirm_order', {}), say('சரி.'));
  await a.turn(1, '1 sakkarai');
  const r = await a.turn(1, 'aama');
  assert.equal(d.memory().vocab.length, 1);
  assert.equal(d.orders().length, 0); // the yes was spent on save_word
  assert.ok(r.trace.some((t) => /Refused/.test(t.text)));
});

test('save_word refused without a yes; remember_brand needs the product named', async () => {
  const { d, a } = setup(
    call('save_word', { term: 'vellai', product_id: 9 }), call('remember_brand', { category: 'oil', product_id: 2 }), say('சரி.'));
  await a.turn(1, 'vellai venum');
  assert.equal(d.memory().vocab.length, 0);
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
    call('propose_order', { lines: [{ product_id: 9, qty: 5 }, { product_id: 11, qty: 2 }] }), say('ஆமா?'), call('confirm_order', {}), say('சரி.')));
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
