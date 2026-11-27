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
