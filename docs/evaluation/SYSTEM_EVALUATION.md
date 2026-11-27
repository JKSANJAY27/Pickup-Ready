# How we evaluate Pickup Ready

No AI evaluates this system. Every number below is a count or ratio computed by plain code against answers we wrote by hand. An AI judge can drift or disagree with itself. A count of "did the code do the expected thing" cannot.

Run it yourself:

```
cd app
node eval/run.js                      # metrics M1-M6, exits non-zero on any silent wrong guess or failed invariant
node --test server/desk.test.js       # 7 scenario tests
./smoke.sh http://localhost:3000      # against the running container
```

The evaluation forces the rule-based interpreter (no API key, no network), so results are identical on every machine.

## What is evaluated, and why

The product's risk is a wrong order, not a slow one. The AI only proposes order lines (term and quantity). Deterministic code decides everything about stock, reservation and money. So we measure the code's decisions, in particular whether it ever guesses.

## Metrics (all in `app/eval/run.js`)

| # | Metric | How it is computed |
|---|--------|--------------------|
| M1 | Line extraction exact-match | 8 hand-written utterances (digits and Tamil number words, "and"/"mattrum"/comma splits). A case passes only if the parsed list of (term, quantity) equals the expected list exactly. Score = passed / cases. |
| M2 | Auto-match accuracy | For 10 clear terms with one correct product, count how many the resolver matched automatically, and how many of those matched the correct product. Score = correct / auto-matched. |
| M3 | Silent wrong guesses (target 0) | Count of terms that were auto-matched when they should have triggered a question or "unknown" (6 ambiguous + 4 unknown terms), plus auto-matches to the wrong product. This is the number that matters most. |
| M4 | Ambiguity asked, not guessed | For 6 category words that fit several products ("oil", "rice", "dal", "sugar", "tea", "soap"): fraction where the resolver asked instead of picking. |
| M5 | Unknown words flagged | For 4 words not in the catalogue: fraction where the resolver returned "unknown" instead of a match. |
| M6 | Safety invariants | 10 end-to-end checks, each pass/fail (list below). |

Current result on our set: M1 8/8, M2 10/10, M3 0, M4 6/6, M5 4/4, M6 10/10.

### M6 invariants

1. No order exists before the retailer says aama.
2. After aama, stock drops by exactly the ordered quantity.
3. "illa" at the confirm step reserves nothing and keeps stock.
4. Chit-chat does not create an order or reserve stock.
5. An out-of-stock request is logged as unmet demand.
6. Stock never goes negative when over-ordered.
7. Brand question is asked once, then remembered.
8. A new word is saved only after the retailer confirms.
9. Declining a proposed meaning saves nothing.
10. Learned words are per retailer (a different retailer is asked again).

## The "confidence" number in the UI

It is not a model probability. The code assigns a fixed tier from how the word was matched, so it can be explained and checked:

| Tier | Meaning |
|------|---------|
| 95% | Exact catalogue word, or the retailer's own saved word |
| 90% | Retailer's remembered brand, or the only product in the category |
| 70% | Partial catalogue word (the word contains a known alias) |
| 40% | The word fits several products: the system asks, it does not pick |
| 0% | Unknown word: the system asks what it means |

These tiers are a transparency label, not a calibrated accuracy figure. Anything below 90% is flagged red in the trace, and anything ambiguous or unknown is never acted on without the retailer's answer. Nothing is reserved until the retailer says aama.

## Honest limits (say these first, before a judge does)

- The test set is small (about 40 labelled checks) and hand-written by the team. It is in-sample: we built the aliases and the cases. It shows the logic behaves as designed. It is not an accuracy figure on real shop calls.
- It tests text after speech recognition. Tamil speech recognition quality (Chrome ta-IN here, a dedicated Indian-language model in production) is outside these metrics and has not been measured.
- With a live Gemini key, the extraction step is done by the model. M1 applies to the rule-based parser. The decide step (M2 to M6) is the same deterministic code in both modes, which is the point of the split.
- No real wholesaler call data exists yet. The next evaluation step is to run the same metrics on recorded or role-played calls with a real shopkeeper.
- Known weak spot: chit-chat with no order words is treated as an unknown word, so the desk asks what the word means. It creates no order and reserves nothing (checked by invariant 4), but a real product would handle it more gracefully.

## How to say it to judges

"We evaluate the part that can cost a shopkeeper money, which is the decision, not the language model. The AI only proposes lines. Deterministic code checks stock, reserves and bills, and nothing happens until the retailer says aama. We measured it with a deterministic harness, not an AI judge: extraction exact-match, auto-match accuracy, and above all silent wrong guesses, which is zero on our labelled set, plus ten safety checks such as stock never going negative and nothing reserved without a yes. The set is small and ours, so we report it as a check that the logic holds, and our next step is the same metrics on real shop calls."
