# Pickup Ready — Demo Script (YouTube Walkthrough)

> Source: `pickup-ready-r2-demo-script-82008881.txt` (Nov 27, 2026)
> Target duration: ~2.5 minutes
> Record in Chrome on desktop, mic permission granted, Tamil speech (`ta-IN`) enabled.
> One take per section is fine; cut them together.

---

> [!IMPORTANT]
> Show **real screens only**. No mockups. Everything shown must be what the code does.

---

## [0:00–0:20] HOOK — Talking Head or Title Card + Voiceover

> *"A retailer in Tamil Nadu restocks his shop by phone. Today he travels without knowing what's in stock. Pickup Ready fixes that — he speaks his order, and travels only when it's reserved."*

---

## [0:20–1:40] CORE VOICE FLOW — Screen Recording, Call Tab (Dialer-Style)

**Step 1 — Dial in**
On the call screen, the retailer dials the shop's number (dialer UI, ringing tone, connected). The AI answers and greets him by name in Tamil.

> *Label clearly: "This is the phone call, simulated in the browser."*

**Step 2 — Place the order**
Speak (Tamil, code-mixed is fine):
> *"Repeat last Monday's list, sugar vendaam, oil rendu tin extra."*

Show: app finds Monday's order, removes sugar, adds 2 oil tins, resolves brand and pack size from history.

**Step 3 — Hit a shortage**
Force a shortage (order something low-stock).

Show: app names one in-stock alternative with brand, pack size, price. Accept it by voice.

**Step 4 — Vocabulary memory**
Use a saved alias for one item. Mention it was saved after confirmation.

**Step 5 — Read-back and confirm**
App reads back products, brands, quantities, pack sizes, prices in Tamil. Say "aama."

Show: stock reserved → pickup time confirmed → packing list created.

---

## [1:40–2:05] PACKER + OWNER — Quick Cuts

**Packer tab:**
Check items off as packed.

*Optional:* say "order 42-la oru oil tin add pannunga" and show the live update.

**Owner tab:**
Ask: *"Indru enna enna kidaikkala?"*

Show the unmet-demand answer.

---

## [2:05–2:30] CLOSE — Voiceover Over the Bill Screen

> *"Everything you saw is reserved, packed and billed before the retailer leaves home. Pickup Ready remembers his brands and his words. This prototype shows the call in the browser; the product answers the shop's existing phone line, so the retailer changes nothing about how he orders today."*

---

## Recording Notes

- **If live Tamil speech recognition misbehaves** during recording, use the typed-transcript path through the same AI interpreter (the build supports both) and say so in one line on screen. **Do not fake a voice pass.**
- Keep the **"Scripted sample, not live AI"** fallback out of the main take; if any path uses it, that section's label stays visible.
- Judges can ask, and **an honest label is a strength, not a weakness.**
- Mic guidance: **built-in mic is fine; avoid Bluetooth earbuds** (they compress audio and clip the start of speech).

---

## Demo Beat Checklist (Practice Until These Land First Try)

- [ ] Seed data loaded (25 products, 3 retailers)
- [ ] "Repeat last Monday's list" resolves correctly
- [ ] Shortage alternative appears with brand + pack size + price
- [ ] Vocabulary alias resolves without asking again
- [ ] Tamil read-back is accurate
- [ ] "aama" triggers reservation + packing list creation
- [ ] Packer tab updates live
- [ ] Owner's unmet-demand answer is correct
- [ ] Bill screen shows pickup code

---

## Suggested Demo Beats for Judges (Edge Cases to Show)

| Edge Case | Why Show It |
|-----------|-------------|
| #7 — Shortage settlement | Judges scoring "error handling" look for this |
| #8 — Brand question | Shows per-retailer memory in action |
| #11 — Mid-order correction | Shows "illai" / correction flow |

See [EVALUATION.md](../evaluation/EVALUATION.md) for the full edge-cases list.
