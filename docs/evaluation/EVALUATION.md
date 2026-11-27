# Pickup Ready — Edge Cases & Guards

> Source: `pickup-ready-r2-edge-cases-e57924da.txt` (Nov 27, 2026)
> Grounded in the submitted Round 1 Activity 2 build spec.
> Items marked **[EXTENSION]** go one step beyond the spec — consistent with the spec's rules and cheap to build since they reuse the same `unmet_demand` record.

---

> [!IMPORTANT]
> The Sunday demo should deliberately show **2–3 of these live** (suggested: #7 shortage settlement, #8 brand question, #11 correction) — judges scoring "error handling" will be looking for exactly this list.

---

## Speech Input Problems

### 1. Random or Irrelevant Speech
**Trigger:** Chit-chat, questions that aren't an order.

**Behaviour:**
- Interpreter returns no order lines.
- App replies with one short Tamil question steering back to the order.
- No state changes, nothing reserved.

---

### 2. Unclear / Misheard Input, Conflicting Matches, Missing Unit/Size
**Trigger:** Ambiguous speech, two catalogue matches, or size not specified.

**Behaviour:**
- Ask one short Tamil question.
- If still unresolved → flag **"needs packer check"** and tell the retailer a person must confirm.
- **Never guess.**

---

### 3. Silence or Heavy Noise
**Trigger:** No audio input or unreadable audio.

**Behaviour:**
- Ask them to repeat.
- After two failed attempts → flag for a human and keep the pending order safe.

---

### 4. Code-Mixed Tamil-English (the Normal Way Retailers Speak)
**Trigger:** Every real order.

**Behaviour:**
- Accepted as-is; product names are never translated away.
- Catalogue vocabulary is supplied to the recognizer as keyterm hints where supported.

---

### 5. Accent or Dialect Variation
**Trigger:** Unfamiliar pronunciation patterns.

**Behaviour:**
- Recognition and interpretation layers are swappable, so a better Tamil model drops in without redesign.
- Real production direction: Indic speech model + per-shop vocabulary boosting; fine-tuning only as fallback.

---

## Order Content Problems

### 6. Item Not in the Catalogue At All [EXTENSION]
**Trigger:** Shop has never carried this item — distinct from "out of stock."

**Behaviour:**
- Recorded as `unmet_demand` with `not_carried` flag, linked to retailer and date.
- Retailer hears a plain answer: *"we don't carry that."*
- Request feeds the Owner demand signal (see [VOICE_DATA_INSIGHTS.md](../voice-data-insights/VOICE_DATA_INSIGHTS.md)).

---

### 7. Item in Catalogue But Out of Stock
**Trigger:** Retailer requests an item with stock ≤ 0.

**Behaviour:**
- Name **ONE** in-stock alternative with brand, pack size, and price; wait for acceptance or rejection.
- Record the unavailable request as `unmet_demand` **separately** from accepted substitutes.

---

### 8. Ambiguous Brand or Pack Size
**Trigger:** Retailer says "oil" — which brand, which tin?

**Behaviour:**
- Resolve from that retailer's confirmed history first.
- If still ambiguous → ask.
- A saved alias **never** resolves an ambiguous pack size by itself.

---

### 9. Quantity Confusion (moodai, tin, box)
**Trigger:** Unit terms with no universal size.

**Behaviour:**
- Use the selected product's catalogue pack size, or ask.
- **No assumed conversions.**

---

### 10. Duplicate Lines
**Trigger:** Same product mentioned twice in one order.

**Behaviour:**
- Merge into one line.
- Read back the combined quantity for confirmation.

---

### 11. Mid-Order Correction
**Trigger:** Retailer says "illai" at read-back, or "actually make it 6."

**Behaviour:**
- Ask which line is wrong.
- Correct it.
- Reconfirm the **full corrected order**.
- Corrections are **caught**, not appended.

---

### 12. Interruption During Read-Back
**Trigger:** Retailer speaks during the confirmation read-back.

**Behaviour:**
- Treated as a correction trigger.
- Re-read only the affected lines, then continue confirmation.

---

## State and Money Guards

### 13. Stock Changes Between Read-Back and "aama"
**Trigger:** Another order reserves the same item in the window between read-back and confirmation.

**Behaviour:**
- Availability is **rechecked at confirmation**.
- If it changed → explain what changed and get a **new confirmation** before reserving.
- Stock is reserved **only** at confirmation.

---

### 14. Addition Mid-Packing
**Trigger:** "order 42-la oru oil tin add pannunga" arrives while packing is in progress.

**Behaviour:**
- Confirm the change.
- Recheck and reserve its stock.
- Update the Packer tab **live**.
- A billed order is **never** silently edited.

---

### 15. Billing With Anything Unresolved
**Trigger:** Attempt to bill while any line is unconfirmed / unresolved / unreserved / unpacked.

**Behaviour:**
- **Billing is blocked.**
- One bill, catalogue prices, simulated WhatsApp-style bill with pickup code.
- No real messages are ever sent.

---

### 16. AI Failure Mid-Call
**Trigger:** Model API error or missing AI configuration.

**Behaviour:**
- Explain to the retailer.
- Preserve the pending order.
- Reserve / bill nothing.
- Missing AI configuration **disables live interpretation** instead of silently substituting the scripted sample.

---

### 17. Repeat-Order Reference Fails
**Trigger:** "last Monday's list" but no order exists for that day.

**Behaviour:**
- Ask which order they mean.
- Show the closest dated orders.
- **Never fabricate a repeat.**

---

## First-Use and Memory Guards

### 18. New Retailer, No History
**Trigger:** First order from a retailer not yet in the system.

**Behaviour:**
- Brand questions are **mandatory** on first use of any product.
- The chosen default is saved only after confirmation.

---

### 19. Unknown Word or New Alias
**Trigger:** Retailer uses a word not in the catalogue or their alias table (e.g., "Florence kilo").

**Behaviour:**
1. Look up catalogue terms and that retailer's confirmed aliases first.
2. If unresolved → ask: *"Florence — ice bag, 15 kg pack, correct?"*
3. A new alias is saved **only** after the retailer or packer confirms product, unit, and size.
4. Lookup and saving stay separate operations; memory is always per-retailer.
5. After two failures → flag **"needs packer check"** instead of guessing.

---

## Guard Summary Table

| # | Category | Key Rule |
|---|----------|----------|
| 1–5 | Speech input | Never guess; always ask or flag |
| 6 | Not-carried item | Log `not_carried` flag; never confuse with out-of-stock |
| 7 | Out of stock | One alternative; record unmet demand |
| 8 | Ambiguous brand/size | Alias never resolves ambiguous size alone |
| 9 | Unit confusion | Use catalogue pack size or ask; no assumed conversions |
| 10 | Duplicate lines | Merge + read back |
| 11–12 | Corrections | Catch, not append; re-read affected lines |
| 13 | Race condition | Recheck stock AT confirmation |
| 14 | Mid-packing addition | Confirm → recheck → reserve → live update |
| 15 | Billing guard | Block until all lines packed + confirmed |
| 16 | AI failure | Preserve order; disable interpretation; never fake |
| 17 | Bad repeat reference | Show closest orders; never fabricate |
| 18 | New retailer | Mandatory brand questions first time |
| 19 | Unknown alias | Ask → confirm → save; two-strike flag |
