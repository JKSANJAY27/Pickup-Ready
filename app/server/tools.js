// The AI's only hands: every tool runs deterministic Desk code. The model proposes, this code decides.
// Gates are enforced here, not in the prompt.
import { norm } from './interpreter.js';

const row = (p) => ({ product_id: p.id, name: p.name, price: p.price, stock: p.stock });

export const TOOL_DECLARATIONS = [
  { name: 'lookup_item', description: 'Match a word the retailer said (Tamil or English shop talk) to a catalogue product. Returns match, ambiguous (with options to ask about) or unknown. Always call this before naming any product, price or stock.',
    parameters: { type: 'OBJECT', properties: { term: { type: 'STRING' }, qty: { type: 'INTEGER' } }, required: ['term'] } },
  { name: 'get_last_order', description: 'Return this retailer\'s most recent order lines (product ids, quantities, current price and stock). Use it when they say "same as last time" or "usual", then read the lines back with propose_order.',
    parameters: { type: 'OBJECT', properties: {} } },
  { name: 'find_alternative', description: 'Find ONE in-stock alternative of the same kind and pack size for a product that is out of stock.',
    parameters: { type: 'OBJECT', properties: { product_id: { type: 'INTEGER' }, qty: { type: 'INTEGER' } }, required: ['product_id', 'qty'] } },
  { name: 'propose_order', description: 'Build the pending order from resolved product ids and quantities. Checks stock and returns the exact read-back lines and total to say to the retailer. Does NOT reserve.',
    parameters: { type: 'OBJECT', properties: { lines: { type: 'ARRAY', items: { type: 'OBJECT', properties: { product_id: { type: 'INTEGER' }, qty: { type: 'INTEGER' } }, required: ['product_id', 'qty'] } } }, required: ['lines'] } },
  { name: 'confirm_order', description: 'Reserve the pending order. Call it ONLY after you read the order and total back and the retailer then clearly agreed, in any words (aama, sari, ok, correct, yes). If their reply is unclear, a question, or silence, do not call it: ask again. Pass their confirming words in retailer_said.',
    parameters: { type: 'OBJECT', properties: { retailer_said: { type: 'STRING', description: 'the retailer\'s own words that you judged to be a clear confirmation' } }, required: ['retailer_said'] } },
  { name: 'end_call', description: 'Hang up. Call it when the order is finished and you have said goodbye, or when the retailer says bye or wants to stop. Say your goodbye in the same turn.', parameters: { type: 'OBJECT', properties: {} } },
  { name: 'cancel_order', description: 'Drop the pending order when the retailer says no (illa).', parameters: { type: 'OBJECT', properties: {} } },
  { name: 'save_word', description: 'Remember that this retailer\'s own word means a product. Ask first ("should I save X as Y?") and call this only after the retailer clearly agrees, in any words. Pass their words in retailer_said.',
    parameters: { type: 'OBJECT', properties: { term: { type: 'STRING' }, product_id: { type: 'INTEGER' }, retailer_said: { type: 'STRING' } }, required: ['term', 'product_id', 'retailer_said'] } },
  { name: 'remember_brand', description: 'Remember which product this retailer means by a category word (for example "oil"). Only works if the retailer\'s latest message names that product.',
    parameters: { type: 'OBJECT', properties: { category: { type: 'STRING' }, product_id: { type: 'INTEGER' } }, required: ['category', 'product_id'] } },
  { name: 'report_not_carried', description: 'Record that the retailer asked for something we do not carry, after they said it is not a product we have.',
    parameters: { type: 'OBJECT', properties: { term: { type: 'STRING' }, qty: { type: 'INTEGER' } }, required: ['term'] } },
];

export function newSession(retailerId) {
  return { retailerId, contents: [], pending: null, lastUser: '', turn: 0, proposedTurn: -1, askedTurn: -1, ended: false, seen: new Set(), transcript: [] };
}
// Called once per retailer utterance. No word is matched here: the model judges what the retailer meant.
export function startTurn(s, text) { s.lastUser = text; s.turn++; }

export function runTool(desk, s, name, args = {}, trace = []) {
  const T = (text, extra = {}) => trace.push({ who: 'code', text, ...extra });
  const qty = Math.max(1, Math.floor(Number(args.qty) || 1));
  switch (name) {
    case 'lookup_item': {
      const term = norm(String(args.term || ''));
      const r = desk.resolve(s.retailerId, term);
      if (r.kind === 'none' || r.kind === 'ask') s.askedTurn = s.turn;
      if (r.kind === 'none') {
        const suggestions = desk.suggest(term);
        T(`"${term}" is not a word I know. Not guessing.${suggestions.length ? ` Closest in-stock catalogue items: ${suggestions.map((x) => x.name).join(', ')}` : ' No close catalogue item'}`, { confidence: 0, unsure: true });
        return { status: 'unknown', term, suggestions, note: 'suggestions are real in-stock catalogue rows, offer them as a question, never as a fact about what the word means' };
      }
      if (r.kind === 'ask') { T(`"${term}" could be ${r.options.length} products. Asking the retailer, not guessing`, { confidence: r.confidence, unsure: true }); return { status: 'ambiguous', options: r.options.map(row) }; }
      const p = desk.product(r.product.id);
      T(`"${term}" matched to ${p.name} via ${r.via}. Stock ${p.stock}`, { confidence: r.confidence, unsure: r.confidence < 0.9 });
      const key = `oos:${p.id}`;
      if (p.stock <= 0 && !s.seen.has(key)) { s.seen.add(key); desk.unmet(s.retailerId, term, p.id, 'out_of_stock', qty); }
      return { status: 'match', ...row(p), in_stock: p.stock > 0, match_confidence: r.confidence };
    }
    case 'get_last_order': {
      const last = desk.recentOrders(s.retailerId, 1)[0];
      if (!last) { T('No earlier order found for this retailer', { unsure: true }); return { found: false }; }
      const lines = last.lines.map((l) => { const p = desk.product(l.product_id); return { ...row(p), qty: l.qty, in_stock: p.stock >= l.qty }; });
      T(`Last order #${last.id}: ${lines.map((l) => `${l.qty} x ${l.name}`).join(', ')}`);
      return { found: true, order_id: last.id, lines };
    }
    case 'find_alternative': {
      const p = desk.product(Number(args.product_id));
      if (!p) return { error: 'unknown product_id' };
      const alt = desk.alternative(p, qty);
      T(alt ? `Alternative for ${p.name}: ${alt.name}` : `No in-stock alternative for ${p.name}`);
      return alt ? { alternative: row(alt) } : { alternative: null };
    }
    case 'propose_order': {
      const items = [], unavailable = [], capped = [];
      for (const l of Array.isArray(args.lines) ? args.lines : []) {
        const p = desk.product(Number(l.product_id));
        const q = Math.max(1, Math.floor(Number(l.qty) || 1));
        if (!p) { unavailable.push({ product_id: l.product_id, reason: 'unknown product' }); continue; }
        if (p.stock <= 0) { unavailable.push({ ...row(p), reason: 'out of stock' }); continue; }
        if (p.stock < q) { capped.push({ ...row(p), asked: q, available: p.stock }); const k = `short:${p.id}`; if (!s.seen.has(k)) { s.seen.add(k); desk.unmet(s.retailerId, p.name, p.id, 'out_of_stock', q - p.stock); } items.push({ product: p, qty: p.stock }); continue; }
        items.push({ product: p, qty: q });
      }
      if (!items.length) { s.pending = null; T('Nothing could be proposed: every line was unavailable', { unsure: true }); return { error: 'no valid lines', unavailable }; }
      const total = items.reduce((a, i) => a + i.qty * i.product.price, 0);
      s.pending = { items, total }; s.proposedTurn = s.turn;
      T(`Proposed order ready: ${items.map((i) => `${i.qty} x ${i.product.name}`).join(', ')}, total ₹${total}. Waiting for the retailer to confirm`);
      return { readback: items.map((i) => ({ qty: i.qty, name: i.product.name, line_total: i.qty * i.product.price })), total, unavailable, capped, next: 'read this back and ask the retailer to confirm; call confirm_order only after a clear agreement in a LATER message' };
    }
    case 'confirm_order': {
      // The model judges whether the retailer agreed. Code only enforces the structure: a pending order, a stated confirmation,
      // and at least one new retailer message since the read-back. No order can be reserved without this tool call (fail closed).
      if (!s.pending) return { error: 'there is no pending order' };
      const said = String(args.retailer_said || '').trim();
      if (!said) { T('Refused: no confirming words from the retailer were given', { unsure: true }); return { error: 'retailer_said is required. Ask the retailer to confirm and wait.' }; }
      if (s.turn <= s.proposedTurn) { T('Refused: the retailer has not replied since the read-back', { unsure: true }); return { error: 'the retailer has not replied since the read-back. Read it back, then wait for their answer.' }; }
      const r = desk.reserve({ retailerId: s.retailerId, items: s.pending.items, mode: 'agent' });
      s.pending = null;
      T(`AI judged the retailer confirmed ("${said.slice(0, 80)}"). Code reserved order #${r.order_id} and reduced stock`);
      return { order_id: r.order_id, status: 'reserved' };
    }
    case 'end_call': {
      s.ended = true;
      T(s.pending ? 'Call ended. The unconfirmed order was not reserved' : 'Call ended');
      s.pending = null;
      return { ended: true };
    }
    case 'cancel_order': { s.pending = null; T('Pending order dropped. Nothing reserved'); return { status: 'cancelled' }; }
    case 'save_word': {
      const p = desk.product(Number(args.product_id)); const term = norm(String(args.term || ''));
      if (!p || !term) return { error: 'bad term or product' };
      if (!String(args.retailer_said || '').trim() || s.turn <= s.askedTurn) { T(`Refused: not saving "${term}" until the retailer has answered the question`, { unsure: true }); return { error: 'ask "should I save X as Y?", wait for their answer, then call with their words in retailer_said.' }; }
      desk.db.prepare('INSERT OR REPLACE INTO vocab_memory VALUES (?,?,?)').run(s.retailerId, term, p.id);
      T(`Learned: "${term}" = ${p.name} for this retailer`);
      return { saved: true };
    }
    case 'remember_brand': {
      const p = desk.product(Number(args.product_id)); const cat = norm(String(args.category || ''));
      if (!p || p.category !== cat) return { error: 'product is not in that category' };
      const said = norm(s.lastUser);
      if (!(p.aliases.some((a) => said.includes(norm(a))) || said.includes(norm(p.name)))) { T('Refused: the retailer did not name that product', { unsure: true }); return { error: 'retailer has not named this product in their latest message' }; }
      desk.db.prepare('INSERT OR REPLACE INTO brand_memory VALUES (?,?,?)').run(s.retailerId, cat, p.id);
      T(`Learned: this retailer's ${cat} = ${p.name}. Won't ask again`);
      return { saved: true };
    }
    case 'report_not_carried': {
      const term = norm(String(args.term || ''));
      const k = `nc:${term}`;
      if (term && !s.seen.has(k)) { s.seen.add(k); desk.unmet(s.retailerId, term, null, 'not_carried', qty); T(`Recorded "${term}" as not carried`); }
      return { recorded: true };
    }
    default: return { error: `unknown tool ${name}` };
  }
}
