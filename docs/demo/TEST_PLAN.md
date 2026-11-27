# Pickup Ready: test plan for the demo

For anyone testing who did not build the app. Do the cases in order on a clean start. Each case lists exactly what to type or click and what you should see. If something differs, write down the case number, what you typed, and what you saw.

Retailers in the dropdown on the Call tab: **Murugan Stores** (R1), **Selvi Provisions** (R2), **Annai Kirana** (R3). Each has its own memory.

Replies on screen show a Tamil line with an English line under it. The expected results below quote the English line.

You can type instead of using the mic for every case. Case 17 covers the mic.

## A. Start-up

**1. Fresh clone starts with no keys.**
```
git clone https://github.com/JKSANJAY27/Pickup-Ready.git
cd Pickup-Ready
git checkout feat/scaffold    # until it is merged to main
docker compose up --build
```
Do not create a `.env`. Wait for "Pickup Ready listening on :3000". Open http://localhost:3000.
Expected: the Call tab loads with a retailer dropdown. The top-right badge says "AI key not set: scripted sample, not live AI". There is no default-server page and no error.

**2. Smoke script.** In a second terminal: `cd app && ./smoke.sh http://localhost:3000`
Expected: prints "health ok", "main screen ok", a config line saying the key is not set, then a JSON reply saying Urad Dal is out of stock.
(That last call leaves an unfinished call for R1. Click "Reset demo data" on the Call tab before the next cases.)

**3. Health check.** Open http://localhost:3000/api/health. Expected: `{"status":"ok"}`.

## B. Call flow (Call tab)

Click **Reset demo data** first. Pick **Murugan Stores**.

**4. Happy path.** Type `5 sakkarai, 2 tata tea` and press Send.
Expected: "Your order: 5 x Sugar 1kg, 2 x Tata Tea Gold 1kg. Total ₹1310. Confirm? (aama / illa)". The "How the system decided" panel shows an "AI proposes"/"Scripted" step, "Code decides" steps with confidence, a stock check for each item, and a "Retailer gate" step: "Waiting for the retailer to say aama. Nothing is reserved until then."

**5. The aama gate.** Open the Packer tab now, before confirming.
Expected: "No orders yet". Go back to Call, type `aama`.
Expected: "Reserved. Order #1. You can travel now, it is guaranteed." The trace says the retailer said aama and that code reserved the lines and reduced stock. The Packer tab now shows Order #1 with both lines, status reserved, and a 4-digit code.

**6. Decline at the gate.** Type `1 sakkarai`, then `illa`.
Expected: "Okay, order cancelled. Nothing reserved." The Packer tab still shows only Order #1.

**7. Shortage with one alternative.** Pick **Selvi Provisions**. Type `2 urad dal`.
Expected: "Urad Dal 1kg is out of stock. Take Toor Dal 1kg (₹165) instead?" Type `aama`: expect an order read-back "2 x Toor Dal 1kg. Total ₹330". Type `aama` again: expect "Reserved. Order #2."
Variant: pick **Murugan Stores**, type `1 red label`. Expected: out of stock, offers Tata Tea Gold 1kg (₹540). Type `illa`: expect "Nothing could be added to the order." (This request is logged as unmet demand for case 14.)

**8. Ambiguous word, brand asked once, then remembered.** Pick **Selvi Provisions**. Type `3 oil`.
Expected: "Which oil?" with four options, and the trace shows a red line "could be 4 products. Not guessing, asking the retailer" at 40% confidence.
Type `sunflower`. Expected: read-back "3 x Gold Winner Sunflower Oil 1L. Total ₹420". The trace shows a purple "Learned: this retailer's oil = Gold Winner Sunflower Oil 1L" line. Type `aama` (Order #3).
Now type `2 oil`. Expected: no question. It goes straight to "2 x Gold Winner Sunflower Oil 1L". Type `aama`.
Then pick **Murugan Stores** and type `2 oil`. Expected: the "Which oil?" question again (memory is per retailer).

**9. Unknown word, vocabulary learning.** Pick **Annai Kirana**. Type `2 vellai`.
Expected: 'Which product do you mean by "vellai"? (say its name, or illa if we don't carry it)'. The trace shows a red line "not a word I know. Not guessing, asking what it means", 0%.
Type `sakkarai`. Expected: 'Save "vellai" as Sugar 1kg for you? (aama / illa)'. Open the "What it has learned" panel: it is still empty (nothing is saved before confirmation).
Type `aama`. Expected: the order read-back for 2 x Sugar 1kg. The panel now shows 'Annai Kirana: "vellai" means Sugar 1kg'. Type `aama` to reserve.

**10. Learned word is reused, and only for that retailer.** Still on Annai Kirana, type `1 vellai`.
Expected: no question, straight to "1 x Sugar 1kg" (95% "this retailer's own saved word"). Type `illa` to cancel.
Pick **Murugan Stores**, type `1 vellai`. Expected: the "Which product do you mean" question again.

**11. Declined meaning saves nothing.** Pick **Selvi Provisions**. Type `1 vellai`, then `sakkarai`, then `illa`.
Expected: the learned panel gets no Selvi entry for "vellai".

**12. Item the shop does not carry.** Type `1 dragon fruit`, then `illa`.
Expected: 'We don't carry "dragon fruit".' and "Nothing could be added to the order." (Logged for the owner, case 14.)

**13. Not enough stock.** Pick **Murugan Stores**. Type `30 tata tea`.
Expected: "Only 12 of Tata Tea Gold 1kg in stock; reserving 12." and a read-back for 12 x Tata Tea Gold 1kg (if you did case 4 first, stock is 10 and it says 10). Type `illa` to cancel.

## C. Packer tab

Case 4/5 must have created Order #1 on Murugan Stores. If you reset, redo cases 4 and 5.

**14a. Mid-packing add.** Open the Packer tab. In the box next to Order #1 type `order 1-la 1 uppu add pannunga` and click **Add**.
Expected: the order list now includes "1 x Salt 1kg".

**14b. Add something unclear.** Type `order 1-la 1 pizza base add pannunga` and click **Add**.
Expected: nothing is added. The list is unchanged (it needs a human packer check).

**15. Auto-bill and pickup code.** Click **Packing done, bill** on Order #1.
Expected: a bill appears: each line with its price, "Total ₹1332" (for the case 4 order plus salt), and "Pickup code: NNNN". The status changes to billed and the buttons disappear. Clicking again is not possible.

## D. Owner tab

**16. Unmet demand answer.** Open the Owner tab and click **What did people want that I couldn't sell?**
Expected: a sentence listing what could not be sold, for example "Urad Dal 1kg (2, out of stock); Brooke Bond Red Label Tea 1kg (1, out of stock); dragon fruit (1, not carried)", plus a table of items, kind, and quantity. The numbers must match what you did.

**16b. Back-in-stock.** In Restock, choose "Urad Dal 1kg", quantity 10, click **Restock**.
Expected: a message appears: "To Selvi Provisions: Urad Dal 1kg is back in stock (10 available). You asked for it earlier. Call to reserve." Restock the same product again: no second message. Restock "Brooke Bond Red Label Tea 1kg": a message goes to Murugan Stores. Restock a product nobody asked for (for example Sugar 1kg): no message.

## E. Voice

**17. Tamil mic.** Use Chrome on desktop and allow the microphone. Click **Speak (Tamil)** and say a short order, for example "rendu kilo sakkarai" or "moonu thuvaram paruppu".
Expected: your words appear as the retailer's message and the desk replies. Note exactly what text Chrome heard. If Chrome's Tamil recognition is poor, the typed path is the demo path. Say so in the video in one line.
Also test in a browser with no speech support (or deny the mic): expected message "Speech recognition is not available in this browser. Type instead." or "Could not hear that. Please repeat, or type." No crash.

## F. Reset, checks, and no-key behaviour

**18. Reset.** Click **Reset demo data** on the Call tab.
Expected: the chat clears, the trace clears, the learned panel says "Nothing learned yet", the Packer tab says "No orders yet", the Owner answer says no unmet demand, and stock is back to the seed numbers (Urad Dal 0, Tata Tea 14).

**19. Data survives a restart.** Place and confirm an order. Stop with Ctrl+C, run `docker compose up` again.
Expected: the order is still on the Packer tab (the data is in a Docker volume). `docker compose down -v` removes it.

**20. Evaluation harness.** `cd app && node eval/run.js` (needs Node 22). Expected: M1 8/8, M2 10/10, M3 0 silent wrong guesses, M4 6/6, M5 4/4, M6 10/10 and ten PASS lines. Then `node --test server/desk.test.js`: 8 tests pass. This is the "how we evaluated" evidence for the video and submission.

**21. No-key behaviour (the submission gate).** On a fresh clone with no `.env`, run `docker compose up --build`. Do cases 4 to 9 once. Expected: all of it works using the rule-based reader, the badge says "AI key not set", and the trace labels the first step "Scripted" (never "AI proposes").

**22. With a real key (optional, only if Yuva has one).** Copy `.env.example` to `.env`, put a real value after `GEMINI_API_KEY=`, run `docker compose up --build`. Expected: the badge says "Live AI on" and the trace's first step says "AI proposes". Try `moonu thuvaram paruppu` and `rendu kilo sakkarai`. If a call fails, the app silently falls back to the rule-based reader. Write down whether the label still says "AI proposes" when it did fall back (it should show "Scripted" for that turn).

## Before recording the demo

1. Click **Reset demo data**.
2. Run cases 4, 5, 7, 8, 9, 14a, 15 and 16 in one clean pass (about 2.5 minutes).
3. Keep the trace panel visible while recording, since it shows the AI proposes and code decides split.

## Known limits (not bugs)

- Chit-chat such as "hello how are you" is treated as an unknown word, so the desk asks what it means. It creates no order.
- Replies in Tamil are short and basic. Ask a native speaker to read them.
- The call is a browser simulation. There is no real telephone line in this prototype.
