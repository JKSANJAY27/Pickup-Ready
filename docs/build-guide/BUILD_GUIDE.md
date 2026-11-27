# Pickup Ready — Build Guide (Day 1, Docker-First)

> Source: `pickup-ready-r2-setup-guide-day1-v2-e021b179.txt` (Nov 27, 2026)
> Docker-First Revision — supersedes the morning version.
> The official Round 2 mail (wispr.notification@scaler.com) adds a hard requirement: the codebase must be built on THEIR Docker Compose template. `docker compose up` must start the app with no extra steps.

---

> [!CAUTION]
> **Missing a required submission item = incomplete submission.** Check every required item before Sunday night.

---

## Required Submission Checklist

| Item | Required | Status |
|------|----------|--------|
| Public GitHub repo built on Scaler/Wispr Docker Compose template | ✅ | — |
| `docker compose up` starts the app with no extra steps | ✅ | — |
| Env vars / API keys listed by NAME in the README (never committed) | ✅ | — |
| Public YouTube link — video walkthrough of prototype running core flow | ✅ | — |
| Investment-style deck (problem + solution, market, downstream dependencies, GTM) | ✅ | — |
| **Deck is checked against the code** — build what the deck says, nothing less | ✅ | — |
| Live link | Optional | — |
| **Deadline: Monday Nov 30, 23:59 IST** — submit button turns off, no late entries | — | — |

---

## Step 0 — Get the Template Link (5 min, today)

The Round 2 dashboard links the Docker Compose template. The mail's "Start building in Round 2" goes to `hackos.scaler.com/wispr/dashboard.html`. Copy the template's repo link and confirm the whole build keys off it.

---

## Step 1 — GitHub Repo FROM the Template (20 min)

1. Clone or fork the template exactly as its instructions say, into the public **`pickup-ready`** repo.
2. Run `docker compose up` on the **empty template** and confirm it starts. This is your baseline; if the empty template doesn't start on your machine, fix it today, not Saturday.
3. README: keep the template's structure; add env vars there as you go.

---

## Step 2 — Wispr Flow Pro (10 min)

Claim the 3-month hackathon perk from the Nov 11 Scaler email. Use it to:
- Dictate prompts to the coding tool
- Write the README out loud
- The mail explicitly suggests building this way

---

## Step 3 — Tool Choice: Cursor (AI-Assisted Editor), NOT Lovable

**Why Cursor, not Lovable:**
- The submission gate is `docker compose up` with no extra steps — that wants a self-contained repo: app + database, everything inside compose.
- Lovable's backend (Lovable Cloud / Supabase) runs on their infrastructure, not inside your Docker Compose. You CAN export Lovable code to GitHub and re-wire it — but that repackaging under a 2-day deadline is exactly where submissions break.
- Cursor + voice dictation through Wispr Flow gives the same "build by voice" story the mail asks for.

**Suggested app shape (adjust to template):**
- **One app service:** Node server that serves the built React frontend AND the JSON API on one port
- **Data:** SQLite file inside the container (zero extra services) unless the template provides a database service — then use theirs
- **AI interpreter call:** server-side only; key sits in `.env` and is listed by NAME in the README, never committed

---

## Step 4 — AI Key (Decide Today)

- Free-tier key (Gemini is fine for demo volume) set as an env var.
- Until it's configured, the app **disables live interpretation** instead of faking it — that behaviour is in the spec, keep it.

---

## Step 5 — Tamil Speech Test (15 min, Do It EARLY)

- Chrome desktop, mic allowed.
- One Tamil sentence through the browser speech recognition (`ta-IN`).
- Result decides whether Sunday's demo uses live speech or the typed-transcript path through the same interpreter.

---

## Step 6 — Live Link (Optional)

Only if it genuinely works. **A broken link is worse than none.** Sunday decision.

---

## By Tonight You Should Have

- [ ] Template link shared; repo created from it; empty template verified with `docker compose up`
- [ ] Wispr Flow Pro claimed
- [ ] AI key decision made
- [ ] Tamil speech test result noted
- [ ] Deck v3 reviewed (investment-style; your feedback still wanted)

---

## Builder Brief for Yuva — Saturday Priority Order

0. **BEFORE ANY APP CODE:** Clone the template repo, run `docker compose up` on the empty template, confirm it starts on your machine.
1. Build inside the template from the first commit.
2. Paste the submitted build spec into Cursor as the first instruction. Scaffold all three tabs (Call dialer-style, Packer, Owner) with seed data (25 products, 3 retailers).
3. AI connection: server-side only, key in `.env`, listed by name in README, never committed.
4. **Core voice loop first:** retailer select → dial/ring → speech or typed transcript → parsed order lines → stock check. Walking skeleton before anything else.
5. Tamil speech test result arrives today. If recognition is weak, polish the typed-transcript path — it's fully legitimate, same interpreter.

**Skip if short on time:** Owner analytics beyond question #1, restock notification, visual polish.

**NEVER skip:** The guards — they map to the [edge-cases doc](../evaluation/EVALUATION.md), which the demo and deck both reference.

---

## Builder Brief for Yuva — Sunday (Freeze at Noon)

6. Finish the loop: shortage settlement, read-back + "aama" reserve, packer tab live update, bill with pickup code.
7. Add the `not_carried` flag on unmet-demand. **NOT OPTIONAL** — the deck describes this feature, and the mail says deck and code are checked against each other. If it's not in the code by freeze, tell Sanjay so he cuts it from the deck.
8. **Noon: FEATURE FREEZE.** Then run the acceptance tests (repeat/edit, shortage, addition mid-packing, packing, billing, owner totals — live-AI vs scripted reported separately).
9. **THE SUBMISSION GATE — run exactly like this:** fresh `git clone` of the public repo into a clean directory → `docker compose up` → full order flow works. If any step needs anything not in the README, the README is wrong — fix the README, not the clone.
10. Deploy the live link only if it genuinely works; broken is worse than none.

---

## Honest Labelling (Non-Negotiable)

- Browser-simulated call → labelled as *the prototype of the phone experience*
- Any scripted fallback → stays labelled **"Scripted sample, not live AI"**
- Typed transcript in the demo → one honest line on screen, never a faked voice pass

---

## Questions

Route through Sanjay. The spec, edge-cases doc, and architecture doc answer most build questions.
