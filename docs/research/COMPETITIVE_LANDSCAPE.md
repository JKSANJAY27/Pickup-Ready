# Pickup Ready — Existing Work Scan & Competitive Landscape

> Source: `pickup-ready-r2-existing-work-scan-1537e921.txt` (Nov 27, 2026)
> All vendor claims below are from that vendor's own site (fetched Nov 27) and are their marketing, not independently verified.

---

## Context

Per the Scaler/Wispr launch press release (ptinews.com, Nov 18): per the IAMAI-Kantar report, **one in five internet users in India already uses voice commands**.

---

## 1. VaaniAI (vaaniai.io)
**AI phone agents for distributors**

**What they do:**
- AI calls retailers on order day, takes the order item by item, reads it back for confirmation, pushes to CRM/ERP via webhooks.
- Payment reminders and scheme announcements.
- Hindi + English listed. Dedicated Indian numbers.
- Free trial (3 days or 25 calls), then from Rs 9,999/month.

**What validates us:** Phone-call ordering with read-back confirmation is a real, sold product category — our core flow is not exotic.

**Gap we fill:** Their agent calls OUT on a schedule; the retailer's own spontaneous **call-in**, per-retailer vocabulary memory, and the **reserve-before-travel** guarantee are not their pitch. Tamil not listed.

---

## 2. Custography (custography.com)
**Voice-first ops layer for stockists and kiranas**

**What they do:**
- Understands calls, WhatsApp, voice notes and documents in Kannada, Hindi, Telugu, **Tamil**, Malayalam and code-mixed speech.
- Extracts intents and draft orders.
- Human approval for anything financial.
- Orchestrates on top of the existing ERP.
- Currently pilot/waitlist only.

**What validates us:** Their design rule — *"conversation is an input, not authority"* — is exactly our AI-proposes / code-decides split. Tamil + code-mixed listed — confirms the language need is real.

**Gap we fill:** Not publicly available; targets the stockist's whole back office, not the retailer's never-wasted trip. No per-retailer word learning in their pitch.

---

## 3. Udyant (udyant.com)
**WhatsApp order management for distributors**

**What they do:**
- Parse WhatsApp messages (text, voice notes, photos) in Hindi/Hinglish/English into orders.
- Credit-limit hard blocks.
- GST invoices; schemes auto-apply.
- Free tier: 50 orders/month.
- Claimed: 95%+ parsing accuracy, order created in under 30 seconds.

**Gap we fill:** WhatsApp-first, not a live phone conversation; Hindi-centric; ordering still means sending a message into a queue, not **settling stock on a call**.

---

## 4. VIKMO (vikmo.app)
**AI-native multi-channel seller platform**

**What they do:**
- WhatsApp AI agent, dealer portal, counter POS, voice-note and photo order intake.
- Tally/Zoho sync.
- Backed by MeitY Startup Hub, IIT Kanpur SIIC, NSRCEL.
- Built inside a real 12,000-SKU business since 2017.

**Gap we fill:** Breadth-first operations suite; live voice conversation in Tamil is not the front door.

---

## 5. PlugDrop.AI (plugdrop.ai)
**AI agents for FMCG route-to-market**

**What they do:**
- Retailers reorder on WhatsApp or by voice between rep visits.
- Beat planning for reps; shelf-audit photos.
- Scheme rollout in local languages.
- Writes into the distributor's DMS/ERP.

**Gap we fill:** Brand/distributor-side tooling aimed at coverage between rep visits; the retailer's trip and the shop's own demand intelligence aren't the product.

---

## Our Differentiators (The Gaps, Put Together)

| Differentiator | Us | Others |
|---|---|---|
| **a. Retailer changes nothing** | Answers the call the retailer already makes | Others ask retailer to message, install, or wait for a scheduled call |
| **b. Reserved before travel** | Stock confirmed and reserved ON the call | None stake the trip |
| **c. Per-retailer vocabulary memory** | Saved only after confirmation, per retailer | None of the five pitch this |
| **d. Tamil-first with code-mixing** | Built for Tamil code-mixed speech | Only Custography lists Tamil (pilot). Others lead with Hindi/Hinglish |
| **e. Asked-vs-sold intelligence** | Sees demand that failed (out-of-stock + never-carried) | Only see orders placed |

---

## Features Worth Borrowing (Post-Hackathon Backlog)

- **Read-back confirmation** (VaaniAI does this too — validates ours; keep)
- **Human approval for financial/risky actions** (Custography) — matches our billing guard
- **Credit-limit blocking** before confirming an order (Udyant)
- **Scheme announcements** and price-change broadcasts (VaaniAI, Udyant)
- **ERP/Tally sync** (all four commercial ones) — integration story for a real launch

---

## Honest Positioning Line

> "We're not the first voice-ordering idea — VaaniAI, Custography, Udyant, VIKMO and PlugDrop all work near this space. We're the one that keeps the retailer's habit exactly as it is: call, speak, hang up, and travel only when the bag is reserved."

---

## Indian-Language Speech Infrastructure

- **Sarvam (Saaras)** — 22 Indian languages, code-mixed, telephony-grade
- **AI4Bharat** — open Indic models

None of the competitors combine:
- Spontaneous call-in
- Tamil code-mix
- Reserve-before-travel
- Per-retailer vocabulary memory

That combination **is** the product.
