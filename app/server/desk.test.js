import { test } from 'node:test';
import assert from 'node:assert/strict';
import { openDb } from './db.js';
import { Desk } from './desk.js';

const fresh = () => new Desk(openDb(':memory:'));

test('shortage: offers one alternative and records unmet demand', async () => {
  const d = fresh();
  const r = await d.turn(1, '2 urad dal');
  assert.equal(r.awaiting, 'alt');
  assert.match(r.reply_en, /out of stock/);
  const r2 = await d.turn(1, 'aama');
  assert.equal(r2.awaiting, 'confirm');
  assert.ok(d.owner().unmet.some((u) => u.kind === 'out_of_stock'));
});

test('brand question asked once, then remembered', async () => {
  const d = fresh();
  let r = await d.turn(1, '3 oil');
  assert.equal(r.awaiting, 'choose');
  r = await d.turn(1, 'sunflower');
  assert.equal(r.awaiting, 'confirm');
  await d.turn(1, 'aama');
  r = await d.turn(1, '2 oil');
  assert.equal(r.awaiting, 'confirm'); // no second question
});

test('full flow: reserve, add mid-packing, bill', async () => {
  const d = fresh();
  await d.turn(1, '5 sakkarai, 2 tata tea');
  const r = await d.turn(1, 'aama');
  assert.ok(r.order_id);
  assert.equal(d.product(9).stock, 195);
  const add = await d.addToOrder(r.order_id, 'order 1-la 1 salt add pannunga');
  assert.equal(add.added.length, 1);
  const bill = d.pack(r.order_id);
  assert.match(bill.bill, /Pickup code/);
  assert.equal(d.pack(r.order_id), null);
});

test('vocabulary: unknown term asked, saved only after confirmation, then reused', async () => {
  const d = fresh();
  let r = await d.turn(1, '2 vellai');
  assert.equal(r.awaiting, 'learn');
  r = await d.turn(1, 'sugar 1kg'.replace('sugar 1kg', 'sakkarai'));
  assert.equal(r.awaiting, 'learn_confirm');
  assert.equal(d.db.prepare('SELECT COUNT(*) c FROM vocab_memory').get().c, 0);
  r = await d.turn(1, 'aama');
  assert.equal(r.awaiting, 'confirm');
  await d.turn(1, 'aama');
  r = await d.turn(1, '1 vellai');
  assert.equal(r.awaiting, 'confirm'); // remembered, no question
});

test('not carried and chit-chat', async () => {
  const d = fresh();
  let r = await d.turn(1, 'dragon fruit');
  assert.equal(r.awaiting, 'learn');
  r = await d.turn(1, 'illa');
  assert.ok(d.owner().unmet.some((u) => u.kind === 'not_carried'));
  r = await d.turn(2, '');
  assert.equal(r.awaiting, null);
});
