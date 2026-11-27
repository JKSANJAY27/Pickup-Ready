# Pickup Ready — System Architecture

> Source: `pickup-ready-r2-architecture-8d1ea78f.txt` (Nov 27, 2026)

---

## 0. The One Design Rule

**Near-zero transition debt.**

The shop changes almost nothing: same phone number, same ringing phone, same counter, no app to install, no new workflow, no training. The retailer changes *literally* nothing — he calls and speaks like he always has.

> Check every new idea against this rule: **if it adds a step for the retailer or the shop, it goes to the backlog, not the product.**

Why an app-based approach fails this rule: every installed-app alternative asks both sides to learn a new tool for a job they already do by phone. The wholesale trade runs on informal trust, credit and calls. An app inserts itself between two people who already have a working habit, and habit is the whole market.

---

## 1. The Three Layers

```
[Phone call]
     |
     v
[VOICE LAYER: hear and speak]
     |
     v
[AI LAYER: understand and propose]
     |
     v
[CORE: decide and record]
     |
     v
[DATABASE]
```

**The golden rule (from the submitted spec):**
> The AI proposes; deterministic code decides. The model never touches stock, reservations, or money directly.

| Layer | Responsibility |
|-------|---------------|
| **Voice Layer** | Turns speech into text; turns replies into speech. Swappable by design. |
| **AI Layer** | Interprets the transcript with catalogue + retailer history as context; proposes structured order lines and short Tamil replies. Never executes anything. |
| **Core** | Deterministic code owns catalogue, stock checks, reservations, shortage handling, bills, packing lists, and every guard in the edge-cases doc. |
| **Database** | The single record of everything; source of every analytics answer. |

---

## 2. Database Schema

```
retailers
  id | name | phone | language_preference | notes

retailer_aliases
  retailer_id | spoken_term | confirmed_product | pack_size
  confirmed_by (retailer OR packer) | confirmed_at
  → Saved ONLY after confirmation; never resolves ambiguous pack size alone.

retailer_brand_defaults
  retailer_id | product | chosen_brand
  → Saved after confirmation.

products (catalogue)
  id | name | brand | pack_size | unit | price | stock | active

orders
  id | retailer_id | status (draft/confirmed/reserved/packing/packed/billed)
  pickup_time | created_from_call_id

order_lines
  order_id | product_id | qty | unit | price
  state (proposed/confirmed/reserved/packed)
  source (live AI / typed transcript)

unmet_demand
  retailer_id | requested_term | resolved_product (if any)
  flag: out_of_stock OR not_carried
  date | outcome (substitute accepted / rejected / none available)
  → "not_carried" flag is the key addition beyond Round 1 spec.

restock_notifications
  unmet_demand_id | retailer_id | product_id | sent_at (simulated)

calls
  id | retailer_id | started | ended | transcript_reference
  completion_flag (zero human correction or not)
```

Every analytics answer is computed from these records. **The model never invents a total.**

---

## 3. The Three Clients

| Client | Prototype | Production |
|--------|-----------|------------|
| **Retailer (Call tab)** | Dialer-style browser screen — shop number, ringing, in-call transcript, proposed order, confirmations | Disappears entirely; the retailer just phones the shop |
| **Packer tab** | Reserved items with pack sizes, unresolved "needs packer check" flags, packed checkboxes; updates live when an order is edited mid-packing | Same |
| **Owner tab** | Stock view + voice-answered questions (see [VOICE_DATA_INSIGHTS.md](../voice-data-insights/VOICE_DATA_INSIGHTS.md)) | Same |

---

## 4. The Analysis Layer

The seven Owner questions, each a plain query over the tables above:

1. What couldn't people buy today? (`unmet_demand`, `out_of_stock`)
2. What are people asking for that we've never carried? (`unmet_demand`, `not_carried`)
3. Which substitutes get accepted or rejected? (`unmet_demand` outcomes)
4. Which brands are retailers switching off? (brand-default change events)
5. Who should hear it's back in stock? (`restock_notifications`)
6. How does the neighbourhood actually name things? (`retailer_aliases`)
7. When do orders come in? (`calls` timestamps)

Plus system-health metrics (see [EVALUATION.md](../evaluation/EVALUATION.md)).

---

## 5. Tech Stack

### Prototype (hackathon weekend)

| Component | Choice |
|-----------|--------|
| Frontend | React + TypeScript + Tailwind |
| Builder | Cursor (AI-assisted) + Wispr Flow (voice dictation) |
| Speech input | Browser speech recognition (Chrome, `ta-IN`) + typed transcript fallback |
| AI key | Server-side only; free-tier Gemini / OpenAI / Anthropic |
| Database | SQLite (inside the Docker container) |
| Repo | Public GitHub; built on Scaler/Wispr Docker Compose template |

### Production ("would look like" version)

| Component | Choice | Notes |
|-----------|--------|-------|
| Telephony | Exotel or Plivo | Indian virtual numbers; TRAI/DoT KYC (1–3 business days). Shop's existing number call-forwarded — shop keeps its number. |
| Speech | Sarvam Saaras v4 | 22 Indian languages + English; code-mixed output mode; keyterm prompting (catalogue = recognition hints); realtime WebSocket; 8 kHz telephony audio support |
| AI interpretation | Hosted LLM with tool-calling | Same role as prototype |
| Core + DB | Postgres + deterministic services | Per-shop isolation; call-audio retention with consent |

> **Adapt, don't train.** Existing tech (browser speech APIs, Saaras, hosted LLMs, CPaaS) is reused. We build only the order-desk core and per-retailer memory — the parts that don't exist yet.

---

## 6. Downstream Dependencies (Slide 8 diagram)

```
[RETAILER'S PHONE CALL]
         |
         v
[VOICE + AI: hear, understand, propose]
         |
         v
[CORE + DATABASE: stock, reserve, pack, bill, remember]
        / \
       v   v
[PACKER]  [OWNER'S QUESTIONS]
```

> "ElevenLabs and Sarvam sell the voice layer the way AWS sells servers. Our product is everything *behind* the call." — See [ALIAS_AND_PLATFORM.md](../research/ALIAS_AND_PLATFORM.md)

---

## 7. Demo Narration Block (~35 seconds)

> "Here's the whole system. A retailer phones the shop and speaks Tamil, mixed with English brand names, like always. The voice layer hears him — in this prototype that's the browser simulating the call; in the product it's the shop's existing number forwarded to an Indian telephony service and a speech model built for Indian languages. The AI proposes an order; it never touches stock or money. The core checks real stock, reserves only on his 'aama', settles shortages while he's still on the line, and hands the packer a list. Everything lands in one database, which is how the owner can ask, by voice, what people wanted that he couldn't sell. The shop changes nothing. That's the architecture, and that's the point."
