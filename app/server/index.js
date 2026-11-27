import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { join, extname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { openDb } from './db.js';
import { Desk } from './desk.js';
import { liveAiAvailable } from './interpreter.js';

const PUBLIC = join(fileURLToPath(new URL('.', import.meta.url)), '..', 'public');
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css' };

export function createApp(db = openDb()) {
  const desk = new Desk(db);
  const json = (res, code, body) => { res.writeHead(code, { 'content-type': 'application/json' }); res.end(JSON.stringify(body)); };
  const body = (req) => new Promise((ok) => { let d = ''; req.on('data', (c) => (d += c)); req.on('end', () => { try { ok(JSON.parse(d || '{}')); } catch { ok({}); } }); });

  return createServer(async (req, res) => {
    const url = new URL(req.url, 'http://x');
    const path = url.pathname;
    try {
      if (path === '/api/health') return json(res, 200, { status: 'ok' });
      if (path === '/api/config') return json(res, 200, { live_ai: liveAiAvailable(), ai_note: liveAiAvailable() ? 'Live AI on' : 'GEMINI_API_KEY not set: key not set, using scripted sample, not live AI' });
      if (path === '/api/state') return json(res, 200, { products: desk.products(), retailers: desk.retailers(), orders: desk.orders() });
      if (path === '/api/call/turn' && req.method === 'POST') { const b = await body(req); return json(res, 200, await desk.turn(Number(b.retailer_id), String(b.text || ''))); }
      if (path === '/api/orders') return json(res, 200, desk.orders());
      let m;
      if ((m = path.match(/^\/api\/orders\/(\d+)\/add$/)) && req.method === 'POST') { const b = await body(req); return json(res, 200, await desk.addToOrder(Number(m[1]), String(b.text || ''))); }
      if ((m = path.match(/^\/api\/orders\/(\d+)\/pack$/)) && req.method === 'POST') { const r = desk.pack(Number(m[1])); return r ? json(res, 200, r) : json(res, 409, { error: 'not open' }); }
      if (path === '/api/memory') return json(res, 200, desk.memory());
      if (path === '/api/reset' && req.method === 'POST') { desk.reset(); return json(res, 200, { ok: true }); }
      if (path === '/api/restock' && req.method === 'POST') { const b = await body(req); const r = desk.restock(Number(b.product_id), Number(b.qty)); return r ? json(res, 200, r) : json(res, 400, { error: 'bad request' }); }
      if (path === '/api/notifications') return json(res, 200, desk.notifications());
      if (path === '/api/owner') return json(res, 200, { ...desk.owner(), answer: desk.ownerAnswer(), insights: desk.insights() });
      if (path.startsWith('/api/')) return json(res, 404, { error: 'not found' });
      const file = normalize(path === '/' ? '/index.html' : path).replace(/^(\.\.[/\\])+/, '');
      const full = join(PUBLIC, file);
      if (!full.startsWith(PUBLIC) || !existsSync(full)) { res.writeHead(404); return res.end('Not found'); }
      res.writeHead(200, { 'content-type': TYPES[extname(full)] || 'application/octet-stream' });
      res.end(readFileSync(full));
    } catch (e) { json(res, 500, { error: String(e.message || e) }); }
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 3000);
  createApp().listen(port, '0.0.0.0', () => console.log(`Pickup Ready listening on :${port}`));
}
