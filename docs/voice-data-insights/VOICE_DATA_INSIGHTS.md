# Pickup Ready — Voice Data Insights

> Source: `pickup-ready-r2-voice-data-insights-74760e11.txt` (Nov 27, 2026)
> Feature story for the Owner side, developed from Sanjay's Nov 27 idea.
> **Grounding rule:** every number shown comes from recorded events (`unmet_demand` records, order history, confirmations) — never invented by the model.

---

## The Core Idea

> Every call leaves a record. Put together, those records tell the owner what the neighbourhood wants — including what he has never stocked.

Billing and inventory software sees what was **sold**. Pickup Ready sees what was **asked**. The difference between sold and asked — out-of-stock requests, never-carried requests, rejected substitutes — is **invisible to every system the shop runs today**. Voice is what captures it, because the asking happens by voice.

---

## The Seven Owner Signals

Each signal maps to one Owner-tab question, answered by voice.

### Signal 1 — "What couldn't people buy today?" *(already in spec)*

**Tamil:** *"Indru enna enna kidaikkala?"*

Returns unavailable items with distinct retailer counts for a chosen date, calculated from `unmet_demand` records. Out of stock, not unknown.

---

### Signal 2 — "What are people asking for that I've never carried?" *(Sanjay's addition)*

Requests for items absent from the catalogue are logged with a `not_carried` flag (see Edge Case #6).

**Example output:** *"9 different retailers asked for ragi flour this month; you don't stock it."*

This is a stocking signal **no billing software produces**, because today those requests die on the phone call.

**Owner action:** Add the product to the catalogue → next call for it succeeds.

> [!IMPORTANT]
> `not_carried` is **distinct** from `out_of_stock` in the data model. Confusing them is what makes ordinary systems blind to new demand.

---

### Signal 3 — "Which substitutes do retailers actually accept?"

Every shortage offer records `accepted` vs `rejected` in `unmet_demand.outcome`.

**Insight:** If retailers keep rejecting the alternative brand of oil, the shelf gap is **brand-specific**, not product-specific.

---

### Signal 4 — "Which brands are retailers switching away from, and why?"

Brand-change requests (*"the tea I got last time wasn't good, what else?"*) are recorded with the switch event in `retailer_brand_defaults`.

A cluster of switches off one brand is a quality signal the owner would otherwise hear only at the counter — by then, it's too late.

---

### Signal 5 — "Who should hear that it's back in stock?"

Restock events link back to the retailers who asked and couldn't buy (`restock_notifications`).

The back-in-stock notification list is itself a demand record: **how many retailers were waiting**.

---

### Signal 6 — "What does each retailer's vocabulary tell me?"

Confirmed aliases per retailer form a **living map of how the neighbourhood actually names products**.

Useful for:
- Labelling shelves and schemes in the words customers use
- Training new counter staff in local terminology

---

### Signal 7 — "When do orders actually come in?"

Call timestamps from the `calls` table give **peak ordering hours and days** — staffing and packing decisions, from records that already exist.

---

## Boundaries (Keep the Story Honest)

- All figures are computed from recorded call events; **the model never invents totals**.
- Everything is per-shop: one shop's call data is its own. No claims about market-wide analytics.
- `not_carried` ≠ `out_of_stock` — this distinction is what makes the intelligence real.
- **Privacy:** Retailers' orders and words belong to the shop; the prototype has no third-party sharing anywhere in the design.

---

## Prototype Scope for Sunday

Owner tab needs only:
1. **Signal #1** (already in spec)
2. **Signal #2** as the headline addition — it reuses the `unmet_demand` record with one extra flag, and demos well:

> *"Ask the shop what people want that it doesn't sell."*

---

## Deck-Ready Differentiator Line

> "Billing software sees what was sold. Pickup Ready sees what was **asked**. The difference — out-of-stock requests, never-carried requests, rejected substitutes — is invisible to every system the shop runs today."
