import test from 'node:test';
import assert from 'node:assert/strict';
import { openDb } from './db.js';
import { Desk } from './desk.js';
import { Agent } from './agent.js';
import { LiveSession } from './live.js';

// A fake Gemini Live socket: records what the server sends, lets the test push server messages.
function fakeSocket() {
  const ws = { sent: [], send(x) { ws.sent.push(JSON.parse(x)); }, close() { ws.onclose?.({}); }, push(o) { return ws.onmessage({ data: JSON.stringify(o) }); } };
  return ws;
}
function setup() {
  const desk = new Desk(openDb(':memory:')); const agent = new Agent(desk, {}); const events = []; let ws;
  const live = new LiveSession({ agent, retailerId: 1, key: 'k', emit: (e) => events.push(e), connect: () => (ws = fakeSocket()) });
  ws.onopen(); return { desk, live, ws, events };
}
const tool = (ws, name, args) => ws.push({ toolCall: { functionCalls: [{ id: 'c1', name, args }] } });
const said = (ws, text) => ws.push({ serverContent: { inputTranscription: { text } } });
const lastResp = (ws) => ws.sent.filter((m) => m.toolResponse).at(-1).toolResponse.functionResponses[0].response;

test('live: setup carries tools, Tamil language and caller context; audio is relayed as 16k PCM', async () => {
  const { ws, live } = setup();
  const su = ws.sent[0].setup;
  assert.equal(su.speechConfig ?? su.generationConfig.speechConfig.languageCode, 'ta-IN');
  assert.ok(su.tools[0].functionDeclarations.some((d) => d.name === 'confirm_order'));
  assert.match(su.systemInstruction.parts[0].text, /Caller: Murugan/);
  live.audio(Buffer.from([1, 2, 3, 4])); // before setupComplete: dropped
  assert.equal(ws.sent.length, 1);
  await ws.push({ setupComplete: {} });
  live.audio(Buffer.from([1, 2, 3, 4]));
  assert.equal(ws.sent[1].realtimeInput.audio.mimeType, 'audio/pcm;rate=16000');
});

test('live: confirm needs a retailer reply after the read-back, then works with natural words', async () => {
  const { ws, desk } = setup();
  await ws.push({ setupComplete: {} });
  said(ws, '5 sakkarai venum');
  await tool(ws, 'propose_order', { lines: [{ product_id: 9, qty: 5 }] });
  await tool(ws, 'confirm_order', { retailer_said: 'sari' });   // model confirms with no reply from the retailer yet
  assert.ok(lastResp(ws).error);
  assert.equal(desk.orders().length, 0);
  said(ws, 'seri pannunga');                                      // the retailer's reply, any words
  await tool(ws, 'confirm_order', { retailer_said: 'seri pannunga' });
  assert.equal(lastResp(ws).status, 'reserved');
  assert.equal(desk.orders().length, 1);
});

test('live: end_call closes the session after the goodbye turn completes', async () => {
  const { ws, events } = setup();
  await ws.push({ setupComplete: {} });
  said(ws, 'bye');
  await tool(ws, 'end_call', {});
  assert.ok(!events.some((e) => e.type === 'call_ended'));      // goodbye still playing
  await ws.push({ serverContent: { turnComplete: true } });
  assert.ok(events.some((e) => e.type === 'call_ended'));
  assert.ok(events.some((e) => e.type === 'closed'));
});

test('live: confirm without any retailer message is refused (fail closed)', async () => {
  const { ws, desk } = setup();
  await ws.push({ setupComplete: {} });
  await tool(ws, 'propose_order', { lines: [{ product_id: 9, qty: 1 }] });
  await tool(ws, 'confirm_order', { retailer_said: 'sari' });
  assert.equal(desk.orders().length, 0);
});

test('live: audio out, transcripts logged for both sides, interruption forwarded', async () => {
  const { ws, events, desk } = setup();
  await ws.push({ setupComplete: {} });
  said(ws, 'hello');
  await ws.push({ serverContent: { modelTurn: { parts: [{ inlineData: { data: 'AAA=', mimeType: 'audio/pcm;rate=24000' } }] }, outputTranscription: { text: 'வணக்கம்' } } });
  await ws.push({ serverContent: { turnComplete: true } });
  await ws.push({ serverContent: { interrupted: true } });
  assert.ok(events.some((e) => e.type === 'audio' && e.data === 'AAA='));
  assert.ok(events.some((e) => e.type === 'interrupted'));
  const t = desk.db.prepare('SELECT role,text FROM call_transcripts ORDER BY id').all();
  assert.deepEqual(t.map((x) => x.role), ['retailer', 'desk']);
});

import { createApp } from './index.js';
test('http: live start without a key is 503 key_not_set (compose with no .env stays healthy)', async () => {
  const app = createApp(openDb(':memory:'), {}, () => false);
  await new Promise((ok) => app.listen(0, ok));
  const r = await fetch(`http://127.0.0.1:${app.address().port}/api/live/start`, { method: 'POST', body: '{"retailer_id":1}' });
  assert.equal(r.status, 503);
  app.close();
});

test('live: binary (Blob) frames from Node WebSocket are decoded', async () => {
  const { ws, events } = setup();
  await ws.onmessage({ data: new Blob([JSON.stringify({ setupComplete: {} })]) });
  assert.ok(events.some((e) => e.type === 'ready'));
});
