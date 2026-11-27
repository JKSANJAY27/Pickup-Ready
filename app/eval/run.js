// Deterministic evaluation harness. No AI judges anything: expected answers are hand-written labels,
// and every metric is a plain count or ratio computed below. Run: node eval/run.js  (forces scripted interpreter)
delete process.env.GEMINI_API_KEY;
import { openDb } from '../server/db.js';
import { Desk } from '../server/desk.js';
import { scriptedParse } from '../server/interpreter.js';

const fresh = () => new Desk(openDb(':memory:'));
const pid = (d, name) => d.products().find((p) => p.name === name).id;

// 1. Extraction: spoken text -> [{term, qty}] (exact match required)
const EXTRACT = [
  ['2 sakkarai', [['sakkarai', 2]]],
  ['5 sakkarai, 2 tata tea', [['sakkarai', 5], ['tata tea', 2]]],
  ['moonu thuvaram paruppu', [['thuvaram paruppu', 3]]],
  ['rendu ponni arisi and oru oil tin', [['ponni arisi', 2], ['oil tin', 1]]],
  ['10 uppu mattrum 4 rava', [['uppu', 10], ['rava', 4]]],
  ['5 maggi', [['maggi', 5]]],
  ['2 surf excel, 3 lifebuoy', [['surf excel', 2], ['lifebuoy', 3]]],
  ['naalu milagai thool venum', [['milagai thool', 4]]],
  ['hello how are you', [['hello how are you', 1]]], // chit-chat: no number; handled downstream, see chit-chat check
];
// 2. Resolution: term -> expected product name, or 'ASK' (several products) or 'NONE' (unknown)
const RESOLVE = [
  ['sakkarai', 'Sugar 1kg'], ['tata tea', 'Tata Tea Gold 1kg'], ['red label', 'Brooke Bond Red Label Tea 1kg'],
  ['thuvaram paruppu', 'Toor Dal 1kg'], ['ulundhu', 'Urad Dal 1kg'], ['uppu', 'Salt 1kg'], ['manjal thool', 'Turmeric Powder 500g'],
  ['atta', 'Wheat Flour (Atta) 5kg'], ['maggi', 'Maggi Noodles Carton'], ['oil tin', 'Gold Winner Sunflower Oil 15L Tin'],
  ['oil', 'ASK'], ['rice', 'ASK'], ['dal', 'ASK'], ['sugar', 'ASK'], ['tea', 'ASK'], ['soap', 'ASK'],
  ['dragon fruit', 'NONE'], ['vellai', 'NONE'], ['pizza base', 'NONE'], ['laptop', 'NONE'],
];

const pct = (a, b) => (b === 0 ? 'n/a' : `${((a / b) * 100).toFixed(1)}% (${a}/${b})`);
const out = {};

// M1 extraction accuracy (skip the chit-chat row, it is checked in M6)
let ok = 0, n = 0;
for (const [text, exp] of EXTRACT.slice(0, -1)) {
  n++;
  const got = scriptedParse(text).map((l) => [l.term, l.qty]);
  if (JSON.stringify(got) === JSON.stringify(exp)) ok++; else console.log('  extraction miss:', text, JSON.stringify(got));
}
out['M1 line extraction exact-match'] = pct(ok, n);

// M2-M5 resolution
const d = fresh();
let autoRight = 0, autoWrong = 0, autoTotal = 0, askCases = 0, askedOk = 0, noneCases = 0, noneOk = 0, expectedAuto = 0;
for (const [term, exp] of RESOLVE) {
  const r = d.resolve(1, term);
  if (exp === 'ASK') { askCases++; if (r.kind === 'ask') askedOk++; else console.log('  should ask:', term); }
  else if (exp === 'NONE') { noneCases++; if (r.kind === 'none') noneOk++; else console.log('  should be unknown:', term); }
  else {
    expectedAuto++;
    if (r.kind === 'match') { autoTotal++; if (r.product.name === exp) autoRight++; else { autoWrong++; console.log('  WRONG match:', term, '->', r.product.name); } }
  }
}
for (const [term, exp] of RESOLVE) { if (exp !== 'ASK' && exp !== 'NONE') continue; const r = d.resolve(1, term); if (r.kind === 'match') autoWrong++; }
out['M2 auto-match accuracy (matched lines that are correct)'] = pct(autoRight, autoTotal);
out['M3 silent wrong guesses (auto-matched when it should ask or say unknown, or matched wrong). Target 0'] = String(autoWrong);
out['M4 ambiguity asked, not guessed'] = pct(askedOk, askCases);
out['M5 unknown words flagged, not matched'] = pct(noneOk, noneCases);
out['   coverage: clear terms auto-matched'] = pct(autoTotal, expectedAuto);

// M6-M9 scenario invariants
const checks = [];
const check = (name, pass) => checks.push([name, pass]);
{ // confirm gate: nothing reserved before aama
  const x = fresh(); await x.turn(1, '5 sakkarai'); check('no order exists before the retailer says aama', x.orders().length === 0);
  const before = x.product(9).stock; await x.turn(1, 'aama'); check('after aama, stock drops by exactly the ordered quantity', x.product(9).stock === before - 5);
}
{ const x = fresh(); await x.turn(1, '5 sakkarai'); await x.turn(1, 'illa'); check('"illa" at the gate reserves nothing and keeps stock', x.orders().length === 0 && x.product(9).stock === 200); }
{ const x = fresh(); const r = await x.turn(1, 'hello how are you'); check('chit-chat does not create an order or reserve stock', x.orders().length === 0 && x.product(9).stock === 200 && r.awaiting !== 'confirm'); }
{ const x = fresh(); await x.turn(1, '2 urad dal'); const u = x.owner().unmet; check('out-of-stock request is logged as unmet demand', u.some((q) => q.kind === 'out_of_stock')); }
{ const x = fresh(); await x.turn(1, '999 sakkarai'); await x.turn(1, 'aama'); check('stock never goes negative when over-ordered', x.products().every((p) => p.stock >= 0)); }
{ const x = fresh(); await x.turn(1, '3 oil'); await x.turn(1, 'sunflower'); await x.turn(1, 'aama'); const r = await x.turn(1, '2 oil'); check('brand question asked once, then remembered', r.awaiting === 'confirm'); }
{ const x = fresh(); let r = await x.turn(1, '2 vellai'); r = await x.turn(1, 'sakkarai'); const saved0 = x.memory().vocab.length; await x.turn(1, 'aama'); check('new word saved only after the retailer confirms', saved0 === 0 && x.memory().vocab.length === 1); }
{ const x = fresh(); await x.turn(1, '2 vellai'); await x.turn(1, 'sakkarai'); await x.turn(1, 'illa'); check('declining a proposed meaning saves nothing', x.memory().vocab.length === 0); }
{ const x = fresh(); await x.turn(1, '2 vellai'); await x.turn(1, 'sakkarai'); await x.turn(1, 'aama'); await x.turn(1, 'aama'); const r = await x.turn(2, '1 vellai'); check('learned words are per retailer (another retailer is asked again)', r.awaiting === 'learn'); }
let passed = 0; for (const [name, pass] of checks) { if (pass) passed++; else console.log('  FAILED:', name); }
out['M6 safety invariants passed'] = pct(passed, checks.length);

console.log('\nPickup Ready evaluation (deterministic, no AI judge)\n');
for (const [k, v] of Object.entries(out)) console.log(`${k}: ${v}`);
console.log('\nInvariants:'); for (const [name, pass] of checks) console.log(`  ${pass ? 'PASS' : 'FAIL'}  ${name}`);
process.exitCode = autoWrong === 0 && passed === checks.length ? 0 : 1;
