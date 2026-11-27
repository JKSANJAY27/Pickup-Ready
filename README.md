## Quickstart

```
docker compose up --build
```
Open http://localhost:3000. No `.env` is needed; keyed features show "key not set".

Owner tab: restock an out-of-stock product and every retailer who asked for it gets one back-in-stock message.

Environment variables (see `.env.example`, placeholders only): `GEMINI_API_KEY` (optional, live interpretation), `GEMINI_MODEL` (optional).

Run tests: `cd app && node --test server/desk.test.js` (Node 22). Run the deterministic evaluation: `cd app && node eval/run.js` (see docs/evaluation/SYSTEM_EVALUATION.md).

---

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

## How to Run (Docker)

```bash
# 1. Clone
git clone https://github.com/JKSANJAY27/Pickup-Ready.git
cd Pickup-Ready

# 2. Configure env vars (see Required Environment Variables below)
cp .env.example .env
# Edit .env with your values

# 3. Start
docker compose up

# App is available at http://localhost:3000
```

### Required Environment Variables

| Variable | Description |
|----------|-------------|
| `AI_API_KEY` | LLM API key (Gemini / OpenAI / Anthropic — free tier is enough for demo volume) |
| `AI_MODEL` | Model name (e.g. `gemini-pro`, `gpt-4o-mini`) |

> [!IMPORTANT]
> API keys are **never committed** to this repository. Set them in `.env` only. The app disables live AI interpretation (not silently fakes it) when the key is missing.

---

## Project Structure

```
pickup-ready/
├── README.md                        ← You are here
├── docker-compose.yml               ← Scaler/Wispr template compose file
├── .env.example                     ← Env var names (no values)
│
├── app/                             ← Application source
│   ├── client/                      ← React + TypeScript + Tailwind frontend
│   │   ├── src/
│   │   │   ├── tabs/
│   │   │   │   ├── CallTab/         ← Retailer call (dialer-style)
│   │   │   │   ├── PackerTab/       ← Packer live list
│   │   │   │   └── OwnerTab/        ← Owner analytics
│   │   │   ├── components/
│   │   │   └── App.tsx
│   └── server/                      ← Node.js JSON API
│       ├── routes/
│       │   ├── orders.ts
│       │   ├── stock.ts
│       │   ├── ai.ts                ← AI interpreter (key lives here, server-side only)
│       │   └── analytics.ts
│       ├── db/
│       │   ├── schema.sql
│       │   └── seed.sql             ← 25 products, 3 retailers
│       └── server.ts
│
└── docs/                            ← All documentation for agents and humans
    ├── architecture/
    │   └── ARCHITECTURE.md          ← System design, layers, DB schema, tech stack
    ├── evaluation/
    │   └── EVALUATION.md            ← All 19 edge cases, guard rules, acceptance tests
    ├── voice-data-insights/
    │   └── VOICE_DATA_INSIGHTS.md   ← Seven owner signals, demand analytics
    ├── research/
    │   ├── COMPETITIVE_LANDSCAPE.md ← VaaniAI, Custography, Udyant, VIKMO, PlugDrop
    │   ├── WHOLESALER_RESEARCH.md   ← Who buys, how relationships work, growth vectors
    │   ├── ALIAS_AND_PLATFORM.md    ← Alias system design; vs ElevenLabs/Sarvam
    │   └── WISPR_FLOW_SCAN.md       ← Wispr Flow capabilities and our use of it
    ├── build-guide/
    │   └── BUILD_GUIDE.md           ← Docker-first setup, submission checklist, day plan
    ├── demo/
    │   └── DEMO_SCRIPT.md           ← YouTube walkthrough script (~2.5 min)
    └── pitch-deck/
        └── PITCH_DECK.md            ← Full slide-by-slide deck content (Draft v3)
```

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
