> **New here? Start with "Run it" below, then read [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) (how everything fits).**

# Pickup Ready

> **Scaler × Whispr Hackathon — Round 2**
> Team: Sanjay J K, Yuva D | Theme: Livelihoods and Small Business | State: Tamil Nadu

---

## "Speak your order. Travel only when it's reserved."

Pickup Ready is a **voice order desk** for Tamil wholesale provisions shops and the small retailers who restock from them. The retailer calls the usual number and speaks Tamil — mixed with English brand names, like always. The system checks live stock, settles shortages on the spot, reserves the confirmed bag, and hands the packer a printed list. **The retailer travels only when the order is guaranteed.**

---

## The Problem

A small retailer phones a wholesale provisions shop to place an order, then travels to collect it, only to find items missing: out of stock, noted wrongly, or sold to someone else. The trip is wasted, the retailer's own shop runs short, and the wholesaler loses the sale and spends the day on call-backs.

- India has an estimated **13–14 million kirana stores**, which still drive roughly **85–90%** of mass grocery sales *(Redseer, 2026)*
- A typical kirana buys from **3–10 wholesalers**; a wholesale mandi run typically takes **half a day** away from the shop *(McKinsey, 2022)*
- **40%** of retailers surveyed named supply-chain inefficiencies as their main procurement pain point *(Redseer, 2024)*
- **63%** of wholesale distributors say they lose sales because the right stock is not available *(Phocas, 2026)*

---

## Why Voice Comes First

Orders already happen over the phone in Tamil shop-talk (moodai, tin, vaati). Retailers are mid-shop with busy hands, and typing a long catalog order into an app does not fit the counter. The key moment is a live back-and-forth ("tea is out, take this brand?") that a form cannot handle. Voice is the interface the retailer already uses — **no new habit is needed**.

---

## The Seven Features

| # | Feature | Description |
|---|---------|-------------|
| 1 | **Live stock check on the call** | Checks inventory during the call and settles shortages with alternatives on the spot — retailer only travels when the bag is guaranteed |
| 2 | **Stock reservation + packing list** | Reserves stock, fixes a pickup time, and sends a packing list to the counter staff |
| 3 | **Open bag updates** | "order 42-la oru oil tin add pannunga" updates the packer's live list mid-packing |
| 4 | **Auto-billing + WhatsApp bill** | When packing is done, auto-bills and sends a WhatsApp-style bill with a pickup code |
| 5 | **Back-in-stock notifications** | If something was out, notifies the retailer when it's back |
| 6 | **Per-retailer memory (two learning loops)** | Brand memory + vocabulary memory — asks which tea once, then remembers; learns retailer-specific words only after confirmation |
| 7 | **Owner demand analytics** | By voice: "tea 2 box, sugar 25kg, 9 retailers kettanga" — surfaces invisible demand |

---

## Run it (for someone cloning cold)

**Prerequisites** (pick one):
- Docker with Compose v2 (Docker Desktop is fine). Nothing else to install.
- or Node.js 22 or newer (no npm install needed, the app has zero dependencies).

**Start with Docker:**
```bash
git clone https://github.com/JKSANJAY27/Pickup-Ready.git
cd Pickup-Ready
docker compose up --build
```
Open **http://localhost:3000**. No `.env` and no key are needed to start. The three tabs are at the top: **Call** (first tab, the retailer's voice call), **Packer**, **Owner**.

**Start without Docker:**
```bash
cd app && node --no-warnings server/index.js     # http://localhost:3000
```

**What "key not set" means:** the Call tab talks to Google Gemini, which needs a free API key. Without one the app still starts, Packer and Owner work, and the Call tab shows **"key not set"** instead of pretending. Nothing is faked.

**Turn on the live AI call:**
1. Get a free key at https://aistudio.google.com/apikey (Google AI Studio).
2. `cp .env.example .env` and set `GEMINI_API_KEY=` to your key. Never commit `.env` (it is git-ignored).
3. `docker compose up --build` again (or restart node with the variable set: `GEMINI_API_KEY=... node --no-warnings server/index.js`).
4. Call tab: choose a retailer, then either
   - **Start call (Tamil)**: Chrome listens (ta-IN), Gemini answers, your browser speaks the reply. Use Chrome. Or
   - **Live voice call (speech-to-speech)**: Gemini Live handles the audio both ways. Use headphones to avoid echo. Or
   - type in the box.
   Allow the microphone when Chrome asks. Say "aama" to confirm an order; nothing is reserved before that.

| Variable | Needed? | Meaning |
|---|---|---|
| `GEMINI_API_KEY` | for the Call tab | Google AI Studio key. Stays on the server, never sent to the browser. |
| `GEMINI_TEXT_MODEL` | optional | Default `gemini-3.5-flash-lite` (verified with a real key). |
| `GEMINI_LIVE_MODEL` | optional | Default `gemini-3.1-flash-live-preview` (verified with a real key). |

Note: the free tier is rate limited (about 15 text requests per minute at the time of testing). A 429 error in the Call tab means wait a few seconds. Model ids come and go; `node app/scripts/spike.js` (with `GEMINI_API_KEY` set) lists what your key can call.

**Tests and evaluation (Node 22):**
```bash
cd app
node --no-warnings --test server/*.test.js    # unit and integration tests, mock model, no key needed
node --no-warnings eval/run.js                # deterministic evaluation harness, no key needed
```
Reset the demo data any time with the "Reset demo data" button on the Call tab.

## Repo map
```
docker-compose.yml, .env.example
app/server/   Node server: index.js (HTTP), agent.js + llm.js + tools.js (AI layer), live.js (Gemini Live relay),
              desk.js (all stock/money logic), db.js + seed.js (SQLite), interpreter.js, *.test.js
app/public/   Plain HTML/JS UI (Call, Packer, Owner tabs)
app/eval/     Deterministic evaluation harness
app/scripts/  spike.js (lists models your key can call)
docs/         ARCHITECTURE.md (start here), plus architecture/, evaluation/, demo/, research/, pitch-deck/, build-guide/, voice-data-insights/
```
Some docs under `docs/` (for example `docs/architecture/` and `docs/build-guide/`) are the original plan written before the build. Where they differ from `docs/ARCHITECTURE.md` or this README, the code and these two files win.

---

## The One Rule Everything Is Checked Against

> **The AI proposes; deterministic code decides. The model never touches stock, reservations, or money.**

---

## Validation Target

> At least **80 of 100 live-AI test orders** completed with zero human correction to product, brand, quantity, or pack size.

We also track:
- Missing-item pickup trips (should fall as the system learns each shop)
- Staff phone minutes per order (should fall as repeat orders get faster)

---

## Honest Labelling (Non-Negotiable)

- Browser-simulated call → labelled as *the prototype of the phone experience*
- Any scripted fallback → **"Scripted sample, not live AI"** label stays visible
- Typed transcript path → one honest line on screen; never faked as a live voice pass

---

## Submission Deadline

**Monday, November 30, 23:59 IST** — submit button turns off, no late entries.
Our plan: submit Sunday night.

---

## Sources

| Source | Use |
|--------|-----|
| Redseer "The AOV Trap" (Jan 2026) | Kirana trip times, distributor counts, traditional trade share |
| Redseer Hybrid-Retail Digest | 13–14M kirana stores, 85–90% traditional trade |
| McKinsey State of Grocery Retail in India (2022) | Half-day wholesale run cost |
| The CapTable on ElasticRun (Oct 2023) | Shop-closure days for stock runs |
| IAMAI-Kantar (via hackathon launch release) | 1-in-5 internet users already use voice in India |
| Sarvam Saaras v4 docs (docs.sarvam.ai, Nov 27) | 22-language Indic ASR, keyterm prompting, telephony audio |
| Phocas (2026) | 63% of distributors lose sales to stockouts |
| Udyant, VaaniAI published pricing | Business model benchmarks |
