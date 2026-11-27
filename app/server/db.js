import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { PRODUCTS, RETAILERS } from './seed.js';

export function openDb(path = process.env.DB_PATH || './data/pickup.db') {
  if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true });
  const db = new DatabaseSync(path);
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY, name TEXT, category TEXT, aliases TEXT, pack REAL, price REAL, stock INTEGER);
    CREATE TABLE IF NOT EXISTS retailers (id INTEGER PRIMARY KEY, name TEXT, town TEXT);
    -- per-retailer memory: brand choice ("tea" -> product) and vocabulary (their own word -> product)
    CREATE TABLE IF NOT EXISTS brand_memory (retailer_id INTEGER, category TEXT, product_id INTEGER, PRIMARY KEY (retailer_id, category));
    CREATE TABLE IF NOT EXISTS vocab_memory (retailer_id INTEGER, term TEXT, product_id INTEGER, PRIMARY KEY (retailer_id, term));
    CREATE TABLE IF NOT EXISTS orders (id INTEGER PRIMARY KEY, retailer_id INTEGER, status TEXT, pickup_code TEXT, total REAL, created_at TEXT);
    CREATE TABLE IF NOT EXISTS order_lines (id INTEGER PRIMARY KEY, order_id INTEGER, product_id INTEGER, qty INTEGER, price REAL);
    -- demand we could not meet: out_of_stock, not_carried, or declined_substitute
    CREATE TABLE IF NOT EXISTS unmet_demand (id INTEGER PRIMARY KEY, retailer_id INTEGER, term TEXT, product_id INTEGER, kind TEXT, qty INTEGER, created_at TEXT);
  `);
  if (db.prepare('SELECT COUNT(*) c FROM products').get().c === 0) {
    const ip = db.prepare('INSERT INTO products (name, category, aliases, pack, price, stock) VALUES (?,?,?,?,?,?)');
    for (const [n, c, a, p, pr, s] of PRODUCTS) ip.run(n, c, JSON.stringify(a), p, pr, s);
    const ir = db.prepare('INSERT INTO retailers (name, town) VALUES (?,?)');
    for (const [n, t] of RETAILERS) ir.run(n, t);
  }
  return db;
}
