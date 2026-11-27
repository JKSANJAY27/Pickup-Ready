# Pickup Ready — Alias System & Platform Differentiation

> Source: `pickup-ready-r2-alias-and-platform-questions-cac441d7.txt` (Nov 27, 2026)
> Answers two hard questions Sanjay raised by voice note:
> 1. How do we handle words like "Florence kilo" meaning ice bag 15 kg — train something or not?
> 2. How are we different from ElevenLabs/Sarvam agent platforms?

---

## Part 1 — The Alias Problem: Data, Not Training

### Three Cases, One Mechanism

| Case | Example |
|------|---------|
| **Colloquial / local names** | "Florence kilo" = ice bag 15 kg (a word that exists nowhere in the catalogue) |
| **Brand-as-generic** | Brand name used as the product type (documented Indian market phenomenon — trademark genericization, Indian Journal of Marketing, 2010) |
| **Abbreviations and jargon** | Shortened or code-mixed forms of catalogue names |

All three are the same mechanism: **the buyer's word and the catalogue's word differ**, and the mapping is real knowledge that lives in the shop's head today.

---

### What Existing Work Says

> "Vectors do not remove the need for synonyms. They reduce it. Trade abbreviations, brand shorthand, old and new product names are still best handled by explicit rules, because you can read, test and reverse them."
> — B2B product search engineering practice (balazscsorba.com)

- **Explicit synonym tables** are the industry-standard mechanism, primary even in the vector-search era.
- The best source of new synonyms is the **log of failed matches**, reviewed regularly.
- Standard merchandising practice: map brand names, abbreviations, regional jargon — and keep updating from real usage (Adobe Commerce synonym best practices).

**Voice adds one twist:** the word must first be *heard* correctly. Recognition and meaning are **two separate layers**.
- Saaras v4 supports **keyterm prompting** — the catalogue and known aliases become recognition hints.
- Keyterms improve *hearing*; the alias table decides *meaning*.
- **Never merge the two.**

---

### The Recommendation (No Model Training Required)

```
Resolution order:
  1. Catalogue terms
  2. That retailer's confirmed aliases
  3. Ask one short Tamil question
  4. After two failures → flag "needs packer check"
  Never silently map.
  An alias NEVER resolves an ambiguous pack size by itself.
```

**Implementation steps:**

1. **Shop-level aliases** — every product carries alias rows, seeded from the shop's own price list and counter staff vocabulary.
2. **Retailer-level aliases** — per-retailer, saved **ONLY** after confirmation (spec rule). "Florence kilo" gets asked once → *"Florence — ice bag, 15 kg pack, correct?"* — and never asked again for that retailer.
3. **Growth loop** — every unresolved word lands in the `unmet_demand` / unresolved record; reviewing it weekly is the shop's vocabulary growth (same zero-result-log ritual ecommerce search teams use, done by the shop owner).
4. **Training is the fallback** — only if a word is consistently mis-*heard* (recognition failure, not meaning failure) does model-level adaptation enter the picture. Per-shop vocabulary boosting comes first, fine-tuning last.

**Why not training?**
A fine-tuned model bakes in yesterday's vocabulary; the shop can't inspect or reverse it; it confuses hearing with meaning. Alias tables are **readable, testable, and reversible** — which is why the industry keeps them even with far bigger AI budgets than ours.

**What competitors do:**
- Custography: confidence score → human approval for low-confidence cases.
- Udyant: parses brand-named orders like "50 Tata Salt bhej do."
- Nobody advertises per-retailer, confirmation-gated vocabulary. **That gap is ours.**

---

## Part 2 — "Can't You Already Build This With ElevenLabs or Sarvam?"

### What These Platforms Actually Provide (checked live, Nov 27)

| Platform | Capability |
|----------|-----------|
| **ElevenLabs ElevenAgents** | Conversation workflows, system prompts, choice of LLM, knowledge bases, telephony/web/mobile deployment, monitoring and evals. Eleven v4 TTS covers 90+ languages including Tamil. |
| **Sarvam Voice Agents ("Genie")** | Builds an agent conversationally; branching call flows, tools and API connections; rent a number with KYC or bring your own provider. |

> Yes, honestly: today anyone can prompt a voice agent, attach a catalogue as a knowledge base, and it will *talk* like an order desk. Pretending otherwise in front of judges would be a mistake. **The answer is what happens after the talking.**

---

### Where the Prompted Agent Breaks

| # | Failure Point | Why It Matters |
|---|---------------|---------------|
| **1** | A knowledge base is retrieval, not transactional state | It can answer "do you carry sunflower oil" from documents. It **cannot** reserve stock atomically, recheck availability at "aama", block billing while a line is unconfirmed, or hold a pending order safe when the AI fails. State needs code and a database — that is our core. |
| **2** | Prompting puts the model in charge of money and inventory | A prompted agent that hallucinates a reservation sends a retailer on a wasted trip — the **exact harm Pickup Ready exists to prevent**. Our rule: the AI proposes, deterministic code decides. |
| **3** | No per-retailer, confirmation-gated memory | Platform "memory" is generic conversation context or a shared KB, not "Florence kilo means ice bag 15 kg **for THIS retailer**, saved after he confirmed it." No prompt writes this for you. |
| **4** | The workflow clients don't exist | Packer screen with live edits, owner analytics, unmet-demand records, back-in-stock pull — you'd build all of it as custom tools and a backend anyway. Once you're doing that, the platform is supplying only the voice layer. |
| **5** | Edge cases are logic, not prompt text | 19 cases (see [EVALUATION.md](../evaluation/EVALUATION.md)), each a state rule, none expressible as a system prompt you can trust. |
| **6** | India plumbing is still on you | Sarvam's own page says "rent a number with KYC" — the telephony reality applies to them too. Conversational quality in code-mixed Tamil on a global TTS/STT stack vs. an Indic model is an evaluation question, not a given. |

---

### The Honest Framing (Use With Judges)

> "ElevenLabs and Sarvam sell the voice layer the way AWS sells servers. Nobody asks how a shop app is different from AWS. Our production architecture is explicitly built **ON** that layer. We compete with none of it. The product is everything **behind** the call: live stock, reservation, per-retailer memory, the packer flow, unmet-demand intelligence, and zero-transition deployment on the shop's existing number. A prompted agent with a knowledge base gets you a convincing conversation — the easy 20%. The other 80% is the product, and it's the part that makes the conversation **safe to act on**."

**Slide 8 Q&A line:**
> "They do the left two boxes; we are the third box — and the third box is what makes the first two safe."
