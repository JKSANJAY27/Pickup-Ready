# Pickup Ready — Pitch Deck (Round 2 Draft v3)

> Source: `pickup-ready-r2-deck-draft-v3-c265e439.txt` (Nov 27, 2026)
> Status: DRAFT for Sanjay's review.
> Investment-style per the official Round 2 mail: problem + solution, addressable market, downstream dependencies (voice providers, models, APIs), go-to-market.
> **THE DECK IS CHECKED AGAINST THE CODE** — every product claim below is in the build spec or the Sunday build plan.

---

> [!CAUTION]
> Every external figure must be attributed. Nothing invented. Deck and code are verified against each other — if a feature isn't built, cut the slide bullet.

---

## Slide 1 — Title

**Pickup Ready**
*The voice order desk for Tamil wholesale shops*

> "Speak your order. Travel only when it's reserved."

**Team:** Sanjay J K, Yuva D
**Theme:** Livelihoods and Small Business
**State:** Tamil Nadu
**Hackathon:** India Runs on Voice, Round 2

---

## Slide 2 — Problem

A small retailer restocks the way his father did: call the wholesale shop, or make the trip and hope.

- Kiranas coordinate across 5–10 suppliers and spend **3–5 hours on each wholesale market trip** *(Redseer, Jan 2026)*
- One kirana owner **shut her shop 3–4 days a month** just to fetch stock *(The CapTable, 2023)*
- And after all that, the item he needs most can still be out of stock at the counter.

> *Speaker note: the trip is not the problem. The trip **without knowing** is the problem.*

---

## Slide 3 — Solution

The retailer calls the shop and speaks Tamil, mixed with English brand names, **like always**.

The order desk answers, checks real stock, reserves it, settles shortages while he's still on the line, and hands the packer a list.

**He travels only when the bag is reserved.**

The shop changes nothing: same number, same phone, no app.

---

## Slide 4 — Demo

*[QR / link to YouTube walkthrough + live link if deployed]*

One call, start to finish:
> repeat order with edits → brand question → shortage settled live → Tamil read-back → "aama" → reserved, packed, billed with a pickup code

> *Speaker note: this slide carries the round — real screenshots only. Everything shown is what the code does.*

See [DEMO_SCRIPT.md](../demo/DEMO_SCRIPT.md) for the full recording guide.

---

## Slide 5 — Market

- India's grocery market: **~US\$658 Bn** in 2025, heading to **~US\$992 Bn** by 2030 *(Redseer, Jan 2026)*
- Kiranas hold **~91%** of it and keep **~86%** even in 2030 *(Redseer)*
- **13–14 million kirana stores** restock through wholesale shops, mostly by phone and in person *(Redseer)*
- The ordering layer between them is still a phone call and a paper chit. **That layer is the market.**

> *Speaker note: all figures from Redseer's published reports. We deliberately don't print a SOM — the wedge is one shop at a time, and the flow it sits on is the country's largest retail channel.*

---

## Slide 6 — Why Now

- One in five internet users in India already uses voice commands *(IAMAI-Kantar, via the hackathon launch release)*
- Indic speech models just became good enough: 22 Indian languages, code-mixed speech, catalogue words as recognition hints *(Sarvam Saaras v4, 2026)*
- The buyers never needed training — **the technology did. That just flipped.**

---

## Slide 7 — Competition & Differentiators

Real products work near this space — VaaniAI, Custography, Udyant, VIKMO, PlugDrop. None combine:

1. The retailer changes nothing — call, speak, hang up
2. Reserved before travel — the never-wasted trip
3. The shop learns each retailer's own words — saved only after he confirms
4. Tamil-first, code-mixed — how the orders actually sound
5. Billing software sees what was **sold**. Pickup Ready sees what was **asked**.

See [COMPETITIVE_LANDSCAPE.md](../research/COMPETITIVE_LANDSCAPE.md) for full analysis.

---

## Slide 8 — Downstream Dependencies

```
[RETAILER'S PHONE CALL]
         ↓
[VOICE + AI: hear, understand, propose]
         ↓
[CORE + DATABASE: stock, reserve, pack, bill, remember]
        ↙ ↘
[PACKER] [OWNER'S QUESTIONS]
```

- The AI proposes; deterministic code decides. **The model never touches stock or money.**
- Prototype: browser-simulated call, real AI interpretation
- Production depends on three providers:
  1. Indic speech model (Saaras-class: 22 Indian languages, code-mixed, telephony-grade audio)
  2. Hosted LLM for interpretation
  3. Indian telephony number (CPaaS + business KYC)
- Plus the shop's own catalogue data. None of it needs the shop to change anything.

> *Speaker note: if a judge asks "couldn't ElevenLabs just do this" — they do the left two boxes; we are the third box, and the third box is what makes the first two safe. Full answer in [ALIAS_AND_PLATFORM.md](../research/ALIAS_AND_PLATFORM.md).*

---

## Slide 9 — Business Model

Per-shop subscription, priced for a thin-margin trade; telephony cost passes through.

Comparable tools in this market:
- Rs 999–2,999/month *(Udyant, their published pricing)*
- Rs 9,999/month *(VaaniAI, their published pricing)*

**The shop pays only after the pilot proves the orders land.**

> *Speaker note: pricing is a proposal anchored to two live competitors' published rates, not a tested price.*

---

## Slide 10 — Go-To-Market

1. **Pilot** with one wholesale shop on the browser version: counter staff take real orders through it, vocabulary grows retailer by retailer — no telephony spend yet
2. **Connect** the shop's existing number through an Indian telephony provider (CPaaS + business KYC) — from that day, the desk answers real calls
3. **Grow** shop by shop; every shop's catalogue and words stay its own
4. **Backlog already mapped:** credit checks on the call, scheme announcements, Tally/ERP sync

> *Speaker note: step 1 proves orders, memory and packing before a single rupee goes to a phone line.*

---

## Slide 11 — What We Measure

- **Wasted trips avoided:** reserved-before-travel confirmations per week *(baseline trips: 3–5 hours each, Redseer)*
- **Order accuracy:** 80 of 100 live-AI orders with zero human correction — a design target, measured from call records as the system runs
- **Demand captured:** never-carried and out-of-stock requests surfaced to the owner per month — today that number is **invisible everywhere**

> *Closing line: Pickup Ready: the shop changes nothing. Everything else does.*

---

## Notes for Sanjay

- The mail's four required elements map to: problem+solution = slides 2–3, market = slide 5, downstream dependencies = slide 8, GTM = slide 10.
- **Deck-vs-code check:** slides 3, 4 and 11 describe exactly what the build spec + Sunday plan produce. If the `not_carried` flag doesn't make Sunday's freeze, **cut slide 11's third bullet** — Yuva knows to tell you.
- **Sources:** Redseer (hybrid-retail digest + AOV Trap, Jan 2026), The CapTable on ElasticRun (2023), IAMAI-Kantar via the Scaler/Wispr launch release, Sarvam docs, Udyant and VaaniAI published pricing. Same evidence standard as Round 1.
- Keep slides sparse; the video does the convincing. **Slides 4 and 8 are the two that matter most.**
