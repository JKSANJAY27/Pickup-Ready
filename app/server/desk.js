// Deterministic order-desk core. The interpreter proposes lines; this code checks stock, reserves, bills and remembers.
import { interpret, norm, isYes, isNo } from './interpreter.js';

const now = () => new Date().toISOString();
const money = (n) => `₹${Math.round(n)}`;

export class Desk {
  constructor(db) { this.db = db; this.sessions = new Map(); }

  products() { return this.db.prepare('SELECT * FROM products ORDER BY id').all().map((p) => ({ ...p, aliases: JSON.parse(p.aliases) })); }
  product(id) { const p = this.db.prepare('SELECT * FROM products WHERE id=?').get(id); return p && { ...p, aliases: JSON.parse(p.aliases) }; }
  retailers() { return this.db.prepare('SELECT * FROM retailers').all(); }
  vocabulary() { return this.products().flatMap((p) => p.aliases); }

  // Map a spoken term to a product for this retailer: own vocabulary, brand memory, catalogue alias, else ask or not carried.
  resolve(retailerId, term) {
    const t = norm(term);
    const own = this.db.prepare('SELECT product_id FROM vocab_memory WHERE retailer_id=? AND term=?').get(retailerId, t);
    if (own) return { kind: 'match', product: this.product(own.product_id) };
    const all = this.products();
    const categories = [...new Set(all.map((p) => p.category))];
    if (categories.includes(t)) {
      const mem = this.db.prepare('SELECT product_id FROM brand_memory WHERE retailer_id=? AND category=?').get(retailerId, t);
      if (mem) return { kind: 'match', product: this.product(mem.product_id), remembered: true };
      const options = all.filter((p) => p.category === t);
      return options.length === 1 ? { kind: 'match', product: options[0] } : { kind: 'ask', category: t, options };
    }
    let best = 0, hits = [];
    for (const p of all) for (const a of p.aliases) {
      const na = norm(a);
      if (t === na || (na.length >= 3 && t.includes(na))) {
        if (na.length > best) { best = na.length; hits = [p]; } else if (na.length === best && !hits.includes(p)) hits.push(p);
      }
    }
    if (hits.length === 1) return { kind: 'match', product: hits[0] };
    if (hits.length > 1) return { kind: 'ask', category: hits[0].category, options: hits };
    return { kind: 'none' };
  }

  unmet(retailerId, term, productId, kind, qty) {
    this.db.prepare('INSERT INTO unmet_demand (retailer_id, term, product_id, kind, qty, created_at) VALUES (?,?,?,?,?,?)')
      .run(retailerId, term, productId ?? null, kind, qty, now());
  }

  alternative(p, qty) {
    return this.products().filter((x) => x.category === p.category && x.id !== p.id && x.pack === p.pack && x.stock >= qty)
      .sort((a, b) => Math.abs(a.price - p.price) - Math.abs(b.price - p.price))[0];
  }

  // Advance through pending items until one needs the retailer's answer, then read back.
  advance(s) {
    while (s.queue.length) {
      const item = s.queue[0];
      if (!item.product) {
        const r = this.resolve(s.retailerId, item.term);
        if (r.kind === 'none') { this.unmet(s.retailerId, item.term, null, 'not_carried', item.qty); s.notes.push({ ta: `${item.term} எங்ககிட்ட இல்லை.`, en: `We don't carry "${item.term}".` }); s.queue.shift(); continue; }
        if (r.kind === 'ask') { s.awaiting = { type: 'choose', options: r.options, category: r.category }; return this.say(s, `எந்த ${r.category}? ${r.options.map((o) => o.name).join(' / ')}`, `Which ${r.category}? ${r.options.map((o) => o.name).join(' / ')}`); }
        item.product = r.product;
      }
      const p = this.product(item.product.id);
      if (p.stock <= 0) {
        const alt = this.alternative(p, item.qty);
        this.unmet(s.retailerId, item.term, p.id, 'out_of_stock', item.qty);
        if (!alt) { s.notes.push({ ta: `${p.name} தீர்ந்துவிட்டது, மாற்று இல்லை.`, en: `${p.name} is out of stock, no alternative.` }); s.queue.shift(); continue; }
        s.awaiting = { type: 'alt', alt };
        return this.say(s, `${p.name} தீர்ந்துவிட்டது. ${alt.name} (${money(alt.price)}) தரட்டுமா?`, `${p.name} is out of stock. Take ${alt.name} (${money(alt.price)}) instead?`);
      }
      if (p.stock < item.qty) { this.unmet(s.retailerId, item.term, p.id, 'out_of_stock', item.qty - p.stock); s.notes.push({ ta: `${p.name}: ${p.stock} மட்டுமே இருக்கு.`, en: `Only ${p.stock} of ${p.name} in stock; reserving ${p.stock}.` }); item.qty = p.stock; }
      s.items.push({ product: p, qty: item.qty });
      s.queue.shift();
    }
    s.awaiting = null;
    if (!s.items.length) { this.sessions.delete(s.retailerId); return this.say(s, 'ஆர்டரில் எதுவும் சேரவில்லை.', 'Nothing could be added to the order.', true); }
    s.awaiting = { type: 'confirm' };
    const total = s.items.reduce((a, i) => a + i.qty * i.product.price, 0);
    const list = s.items.map((i) => `${i.qty} x ${i.product.name}`).join(', ');
    return this.say(s, `உங்கள் ஆர்டர்: ${list}. மொத்தம் ${money(total)}. உறுதி செய்யவா? (ஆமா/இல்ல)`, `Your order: ${list}. Total ${money(total)}. Confirm? (aama / illa)`);
  }

  say(s, ta, en, done = false) {
    const notes = s.notes.splice(0);
    return { reply_ta: [...notes.map((n) => n.ta), ta].join(' '), reply_en: [...notes.map((n) => n.en), en].join(' '), awaiting: s.awaiting?.type ?? null, done, mode: s.mode };
  }

  async turn(retailerId, text) {
    let s = this.sessions.get(retailerId);
    if (s?.awaiting) return this.answer(s, text);
    const { lines, mode } = await interpret(text, this.vocabulary());
    if (!lines.length) return { reply_ta: 'ஆர்டர் சொல்லுங்க, எந்த பொருள் எவ்வளவு வேண்டும்?', reply_en: 'Please tell me your order: which item and how many?', awaiting: null, done: false, mode };
    s = { retailerId, queue: lines.map((l) => ({ ...l })), items: [], notes: [], awaiting: null, mode };
    this.sessions.set(retailerId, s);
    return this.advance(s);
  }

  answer(s, text) {
    const a = s.awaiting;
    if (a.type === 'choose') {
      const t = norm(text);
      const pick = a.options.find((o) => o.aliases.some((x) => t.includes(norm(x))) || t.includes(norm(o.name)));
      if (!pick) return this.say(s, `தெளிவாக இல்லை. ${a.options.map((o) => o.name).join(' / ')}`, `Not clear. Which one: ${a.options.map((o) => o.name).join(' / ')}`);
      this.db.prepare('INSERT OR REPLACE INTO brand_memory VALUES (?,?,?)').run(s.retailerId, a.category, pick.id);
      s.queue[0].product = pick; s.awaiting = null;
      return this.advance(s);
    }
    if (a.type === 'alt') {
      const item = s.queue[0];
      if (isYes(text)) { item.product = a.alt; s.awaiting = null; return this.advance(s); }
      if (isNo(text)) { this.unmet(s.retailerId, item.term, item.product.id, 'declined_substitute', item.qty); s.queue.shift(); s.awaiting = null; return this.advance(s); }
      return this.say(s, 'ஆமா அல்லது இல்ல சொல்லுங்க.', 'Please say aama (yes) or illa (no).');
    }
    if (isYes(text)) return this.reserve(s);
    if (isNo(text)) { this.sessions.delete(s.retailerId); return { reply_ta: 'சரி, ஆர்டர் ரத்து.', reply_en: 'Okay, order cancelled. Nothing reserved.', awaiting: null, done: true, mode: s.mode }; }
    return this.say(s, 'ஆமா அல்லது இல்ல சொல்லுங்க.', 'Please say aama (yes) or illa (no).');
  }

  reserve(s) {
    const total = s.items.reduce((a, i) => a + i.qty * i.product.price, 0);
    const code = String(Math.floor(1000 + Math.random() * 9000));
    const r = this.db.prepare('INSERT INTO orders (retailer_id, status, pickup_code, total, created_at) VALUES (?,?,?,?,?)').run(s.retailerId, 'reserved', code, total, now());
    const id = Number(r.lastInsertRowid);
    for (const i of s.items) {
      this.db.prepare('INSERT INTO order_lines (order_id, product_id, qty, price) VALUES (?,?,?,?)').run(id, i.product.id, i.qty, i.product.price);
      this.db.prepare('UPDATE products SET stock = stock - ? WHERE id=?').run(i.qty, i.product.id);
    }
    this.sessions.delete(s.retailerId);
    return { reply_ta: `பதிவு செய்தாச்சு. ஆர்டர் ${id}. வந்து எடுத்துக்கலாம்.`, reply_en: `Reserved. Order #${id}. You can travel now, it is guaranteed.`, awaiting: null, done: true, order_id: id, mode: s.mode };
  }

  orders() {
    return this.db.prepare('SELECT o.*, r.name retailer FROM orders o JOIN retailers r ON r.id=o.retailer_id ORDER BY o.id DESC').all().map((o) => ({
      ...o, lines: this.db.prepare('SELECT l.*, p.name FROM order_lines l JOIN products p ON p.id=l.product_id WHERE order_id=?').all(o.id) }));
  }

  // Mid-packing addition: "order 42-la oru oil tin add pannunga". Only unambiguous, in-stock items are added automatically.
  async addToOrder(orderId, text) {
    const o = this.db.prepare('SELECT * FROM orders WHERE id=?').get(orderId);
    if (!o || o.status !== 'reserved') return { ok: false, message: 'Order is not open for changes.' };
    const { lines } = await interpret(text.replace(/\border\s*\d+\S*/i, ''), this.vocabulary());
    const added = [], flagged = [];
    for (const l of lines) {
      const r = this.resolve(o.retailer_id, l.term);
      const p = r.kind === 'match' ? this.product(r.product.id) : null;
      if (!p || p.stock < l.qty) { flagged.push(`${l.term}: needs packer check`); continue; }
      this.db.prepare('INSERT INTO order_lines (order_id, product_id, qty, price) VALUES (?,?,?,?)').run(orderId, p.id, l.qty, p.price);
      this.db.prepare('UPDATE products SET stock = stock - ? WHERE id=?').run(l.qty, p.id);
      added.push(`${l.qty} x ${p.name}`);
    }
    return { ok: added.length > 0, added, flagged };
  }

  // Packing done: auto-bill and produce the WhatsApp-style bill with the pickup code.
  pack(orderId) {
    const o = this.db.prepare('SELECT * FROM orders WHERE id=?').get(orderId);
    if (!o || o.status !== 'reserved') return null;
    const lines = this.db.prepare('SELECT l.*, p.name FROM order_lines l JOIN products p ON p.id=l.product_id WHERE order_id=?').all(orderId);
    const total = lines.reduce((a, l) => a + l.qty * l.price, 0);
    this.db.prepare("UPDATE orders SET status='billed', total=? WHERE id=?").run(total, orderId);
    return { order_id: orderId, total, pickup_code: o.pickup_code, bill: `Pickup Ready bill #${orderId}\n${lines.map((l) => `${l.qty} x ${l.name} = ${money(l.qty * l.price)}`).join('\n')}\nTotal ${money(total)}\nPickup code: ${o.pickup_code}` };
  }

  // Owner answers are computed from records; the model never invents a total.
  owner() {
    const unmet = this.db.prepare(`SELECT COALESCE(p.name, u.term) item, u.kind, SUM(u.qty) qty, COUNT(*) times FROM unmet_demand u LEFT JOIN products p ON p.id=u.product_id GROUP BY item, u.kind ORDER BY qty DESC`).all();
    const sales = this.db.prepare("SELECT COALESCE(SUM(total),0) t, COUNT(*) n FROM orders").get();
    return { orders: sales.n, order_value: sales.t, unmet };
  }
  ownerAnswer() {
    const o = this.owner();
    const lost = o.unmet.filter((u) => u.kind !== 'declined_substitute');
    if (!lost.length) return 'No unmet demand recorded yet.';
    return 'Requested but we could not sell: ' + lost.slice(0, 5).map((u) => `${u.item} (${u.qty}, ${u.kind.replace('_', ' ')})`).join('; ') + '.';
  }
}
