# pickup-ready-r2-setup-guide-day1-v2-e021b179.txt

PICKUP READY \- ROUND 2, DAY 1 SETUP GUIDE v2 (Friday Nov 27\) \- DOCKER-FIRST REVISION  
Supersedes the morning version. The official Round 2 mail (today, wispr.notification@scaler.com) adds a hard requirement: the codebase must be built on THEIR Docker Compose template, and "docker compose up" must start the app with no extra steps. Missing a required item \= incomplete submission. This changes the tool choice from step one.

STEP 0 \- GET THE TEMPLATE LINK (today, 5 min)  
The Round 2 dashboard links the Docker Compose template (the mail's "Start building in Round 2" goes to hackos.scaler.com/wispr/dashboard.html). Copy the template's repo link and send it over \- the whole build keys off it.

STEP 1 \- GitHub repo FROM the template (20 min)  
1\. Clone or fork the template exactly as its instructions say, into your public "pickup-ready" repo.  
2\. Run \`docker compose up\` on the EMPTY template and confirm it starts. This is your baseline; if the empty template doesn't start on your machine, fix that today, not Saturday.  
3\. README: keep the template's structure; you'll add env vars there as you go.

STEP 2 \- Wispr Flow Pro (10 min, unchanged)  
Claim the 3-month hackathon perk from the Nov 11 Scaler email. Use it to dictate your prompts to the coding tool and to write the README out loud \- the mail explicitly suggests building this way.

STEP 3 \- THE TOOL CALL: Cursor (or any AI-assisted editor), NOT Lovable  
Clear recommendation: own code, AI-assisted. Reasons:  
\- The submission gate is \`docker compose up\` with no extra steps. That wants a self-contained repo: app \+ database, everything inside compose.  
\- Lovable's backend (Lovable Cloud / Supabase) runs on their infrastructure, not inside your Docker Compose. You CAN export Lovable code to GitHub and re-wire it \- but that repackaging under a 2-day deadline is exactly where submissions break. Not worth it.  
\- Cursor \+ voice dictation through Wispr Flow gives the same "build by voice" story the mail asks for.  
Suggested shape (adjust to the template once you have it):  
\- One app service: Node server that serves the built React frontend AND the JSON API on one port  
\- Data: SQLite file inside the container (zero extra services) unless the template provides a database service \- then use theirs  
\- The AI interpreter call lives server-side only; the key sits in .env and is listed by NAME in the README, never committed

STEP 4 \- AI key (decide today, unchanged)  
A free-tier key (Gemini is fine for demo volume) set as an env var. Until it's in, the app disables live interpretation instead of faking it \- that behaviour is in the spec, keep it.

STEP 5 \- Tamil speech test (15 min, do it EARLY)  
Chrome desktop, mic allowed, one Tamil sentence through the browser speech recognition (ta-IN). Result goes to Yuva before his Saturday session \- it decides whether Sunday's demo uses live speech or the typed-transcript path through the same interpreter.

STEP 6 \- Live link (optional, unchanged)  
Only if it genuinely works. A broken link is worse than none. Sunday decision.

BY TONIGHT YOU SHOULD HAVE  
\- Template link shared, repo created from it, empty template verified with \`docker compose up\`  
\- Wispr Flow Pro claimed  
\- AI key decision made  
\- Tamil speech test result sent to Yuva  
\- Deck v3 read (it's investment-style now, your review still wanted)

# pickup-ready-r2-builder-brief-yuva-v2-00357f1a.txt

PICKUP READY \- BUILDER BRIEF FOR YUVA v2 (Round 2 build, Nov 27-30) \- DOCKER-FIRST REVISION  
Supersedes the morning brief. The official Round 2 mail adds hard submission rules; the build plan now starts from them. New official facts:  
\- Codebase (REQUIRED): public repo built on THEIR Docker Compose template; \`docker compose up\` must start the app with no extra steps; env vars/API keys listed by name in the README  
\- Video walkthrough (REQUIRED): public YouTube link showing the prototype running its core flow  
\- Deck (REQUIRED): investment-style \- problem+solution, addressable market, downstream dependencies, go-to-market. THE DECK IS CHECKED AGAINST THE CODE \- build what the deck says, nothing less  
\- Live link: optional  
\- Deadline: Monday Nov 30, 23:59 IST, submit button turns off, no late entries. Our plan still submits Sunday night.

THE ONE RULE, UNCHANGED  
The AI proposes; deterministic code decides. The model never touches stock, reservations or bills.

SATURDAY (your half day) \- priority order  
0\. BEFORE ANY APP CODE: clone the template repo (link comes from Sanjay today), run \`docker compose up\` on the empty template, confirm it starts on your machine. This is the submission gate; treat it as step zero.  
1\. Build inside the template from the first commit. Suggested shape: one app service (Node server serving the built React frontend \+ JSON API on one port), SQLite file in the container unless the template ships its own database service. No external services the compose file doesn't start.  
2\. Paste the submitted build spec (in the setup guide, verbatim) into Cursor as the first instruction, adapted to this structure. Scaffold all three tabs (Call dialer-style, Packer, Owner) with the seed data (25 products, 3 retailers).  
3\. AI connection: server-side only, key in .env, listed by name in README, never committed. Until configured, the app disables live interpretation rather than faking it (spec behaviour, keep it).  
4\. Core voice loop first: retailer select \-\> dial/ring \-\> speech or typed transcript \-\> parsed order lines \-\> stock check. Walking skeleton before anything else.  
5\. Sanjay's Tamil speech test result arrives today. If recognition is weak, polish the typed-transcript path \- it's fully legitimate, same interpreter.  
Skip if short: Owner analytics beyond question \#1, restock notification, visual polish. NEVER skip: the guards \- they map to the edge-cases doc, which the demo and deck both reference.

SUNDAY (your free day) \- freeze at noon  
6\. Finish the loop: shortage settlement, read-back \+ "aama" reserve, packer tab live update, bill with pickup code.  
7\. Add the "not carried" flag on unmet-demand (one flag on the existing record). NOT OPTIONAL: the deck describes this feature, and the mail says deck and code are checked against each other. If it's not in the code by freeze, tell Sanjay so he cuts it from the deck.  
8\. Noon: FEATURE FREEZE. Then the spec's acceptance tests (repeat/edit, shortage, addition mid-packing, packing, billing, owner totals \- live-AI vs scripted reported separately).  
9\. THE SUBMISSION GATE, run exactly like this: fresh \`git clone\` of the public repo into a clean directory \-\> \`docker compose up\` \-\> full order flow works. If any step needs anything not in the README, the README is wrong \- fix the README, not the clone.  
10\. Deploy the live link only if it genuinely works; broken is worse than none. Support the demo recording (wired/built-in mic, no Bluetooth earbuds; seed data so the demo beats land first try).

HONEST LABELLING (non-negotiable, from the submitted spec)  
\- Browser-simulated call, labelled as the prototype of the phone experience  
\- Any scripted fallback stays labelled "Scripted sample, not live AI"  
\- Typed transcript in the demo \= one honest line on screen, never a faked voice pass

QUESTIONS  
Route through Sanjay. The spec, edge-cases doc and architecture doc answer most build questions.

# pickup-ready-r2-deck-draft-v3-c265e439.txt

PICKUP READY \- ROUND 2 PITCH DECK, FULL DRAFT v3 (Nov 27, 2026\)  
Status: DRAFT for Sanjay's review. Investment-style per the official Round 2 mail: problem \+ solution, addressable market, downstream dependencies (voice providers, models, APIs), go-to-market. THE DECK IS CHECKED AGAINST THE CODE \- every product claim below is in the build spec or the Sunday build plan. Every external figure attributed; nothing invented.

SLIDE 1 \- TITLE  
\[ON SLIDE\]  
Pickup Ready  
The voice order desk for Tamil wholesale shops  
"Speak your order. Travel only when it's reserved."  
Team: Sanjay J K, Yuva D \| Theme: Livelihoods and Small Business \| State: Tamil Nadu \| India Runs on Voice, Round 2

SLIDE 2 \- PROBLEM  
\[ON SLIDE\]  
A small retailer restocks the way his father did: call the wholesale shop, or make the trip and hope.  
\- Kiranas coordinate across 5-10 suppliers and spend 3-5 hours on each wholesale market trip (Redseer, Jan 2026\)  
\- One kirana owner shut her shop 3-4 days a month just to fetch stock (The CapTable, 2023\)  
\- And after all that, the item he needs most can still be out of stock at the counter.  
(Speaker note: the trip is not the problem. The trip WITHOUT KNOWING is the problem.)

SLIDE 3 \- SOLUTION  
\[ON SLIDE\]  
The retailer calls the shop and speaks Tamil, mixed with English brand names, like always.  
The order desk answers, checks real stock, reserves it, settles shortages while he's still on the line, and hands the packer a list.  
He travels only when the bag is reserved.  
The shop changes nothing: same number, same phone, no app.

SLIDE 4 \- DEMO  
\[ON SLIDE\]  
\[QR/link to the YouTube walkthrough \+ live link if deployed\]  
One call, start to finish: repeat order with edits \-\> brand question \-\> shortage settled live \-\> Tamil read-back \-\> "aama" \-\> reserved, packed, billed with a pickup code.  
(Speaker note: this slide carries the round \- real screenshots only. Everything shown is what the code does.)

SLIDE 5 \- MARKET  
\[ON SLIDE\]  
India's grocery market: \~US\$658 Bn in 2025, heading to \~US\$992 Bn by 2030 (Redseer, Jan 2026\)  
Kiranas hold \~91% of it and keep \~86% even in 2030 (Redseer)  
13-14 million kirana stores restock through wholesale shops, mostly by phone and in person (Redseer)  
The ordering layer between them is still a phone call and a paper chit. That layer is the market.  
(Speaker note: all figures from Redseer's published reports. We deliberately don't print a SOM \- the wedge is one shop at a time, and the flow it sits on is the country's largest retail channel.)

SLIDE 6 \- WHY NOW  
\[ON SLIDE\]  
\- One in five internet users in India already uses voice commands (IAMAI-Kantar, via the hackathon launch release)  
\- Indic speech models just became good enough: 22 Indian languages, code-mixed speech, catalogue words as recognition hints (Sarvam Saaras v4, 2026\)  
\- The buyers never needed training \- the technology did. That just flipped.

SLIDE 7 \- COMPETITION AND DIFFERENTIATORS  
\[ON SLIDE\]  
Real products work near this space \- VaaniAI, Custography, Udyant, VIKMO, PlugDrop. None combine:  
1\. The retailer changes nothing \- call, speak, hang up  
2\. Reserved before travel \- the never-wasted trip  
3\. The shop learns each retailer's own words \- saved only after he confirms  
4\. Tamil-first, code-mixed \- how the orders actually sound  
5\. Billing software sees what was sold. Pickup Ready sees what was ASKED.

SLIDE 8 \- DOWNSTREAM DEPENDENCIES (voice providers, models, APIs)  
\[ON SLIDE\]  
\[Three-box diagram: PHONE CALL \-\> VOICE \+ AI (hear, understand, propose) \-\> CORE \+ DATABASE (stock, reserve, pack, bill, remember)\]  
\- The AI proposes; deterministic code decides. The model never touches stock or money.  
\- Prototype: browser-simulated call, real AI interpretation  
\- Production depends on three providers: an Indic speech model (Saaras-class: 22 Indian languages, code-mixed, telephony-grade audio), a hosted LLM for interpretation, an Indian telephony number (CPaaS \+ business KYC)  
\- Plus the shop's own catalogue data. None of it needs the shop to change anything.  
(Speaker note: if a judge asks "couldn't ElevenLabs just do this" \- they do the left two boxes; we are the third box, and the third box is what makes the first two safe. Full answer in the research doc.)

SLIDE 9 \- BUSINESS MODEL  
\[ON SLIDE\]  
Per-shop subscription, priced for a thin-margin trade; telephony cost passes through.  
Comparable tools in this market price at Rs 999-2,999/month (Udyant) to Rs 9,999/month (VaaniAI) \- per their published pricing.  
The shop pays only after the pilot proves the orders land.  
(Speaker note: pricing is a proposal anchored to two live competitors' published rates, not a tested price.)

SLIDE 10 \- GO-TO-MARKET  
\[ON SLIDE\]  
1\. Pilot with one wholesale shop on the browser version: counter staff take real orders through it, vocabulary grows retailer by retailer \- no telephony spend yet  
2\. Connect the shop's existing number through an Indian telephony provider (CPaaS \+ business KYC) \- from that day, the desk answers real calls  
3\. Grow shop by shop; every shop's catalogue and words stay its own  
4\. Backlog already mapped: credit checks on the call, scheme announcements, Tally/ERP sync  
(Speaker note: step 1 proves orders, memory and packing before a single rupee goes to a phone line.)

SLIDE 11 \- WHAT WE MEASURE  
\[ON SLIDE\]  
\- Wasted trips avoided: reserved-before-travel confirmations per week (baseline trips: 3-5 hours each, Redseer)  
\- Order accuracy: 80 of 100 live-AI orders with zero human correction \- a design target, measured from call records as the system runs  
\- Demand captured: never-carried and out-of-stock requests surfaced to the owner per month \- today that number is invisible everywhere  
\[Closing line\] Pickup Ready: the shop changes nothing. Everything else does.

NOTES FOR SANJAY  
\- The mail's four required elements map to: problem+solution \= slides 2-3, market \= slide 5, downstream dependencies \= slide 8, GTM \= slide 10\.  
\- Deck-vs-code check: slides 3, 4 and 11 describe exactly what the build spec \+ Sunday plan produce. If the "not carried" flag doesn't make Sunday's freeze, cut slide 11's third bullet \- Yuva knows to tell you.  
\- Sources: Redseer (hybrid-retail digest \+ AOV Trap, Jan 2026), The CapTable on ElasticRun (2023), IAMAI-Kantar via the Scaler/Wispr launch release, Sarvam docs, Udyant and VaaniAI published pricing. Same evidence standard as Round 1\.  
\- Keep slides sparse; the video does the convincing. Slides 4 and 8 are the two that matter most.

# pickup-ready-r2-demo-script-82008881.txt

PICKUP READY \- ROUND 2 YOUTUBE DEMO SCRIPT (draft, \~2.5 minutes)  
Record in Chrome on desktop, mic permission granted, Tamil speech (ta-IN) enabled.  
One take per section is fine; cut them together. Sanjay's voice on the call.

\[0:00-0:20\] HOOK \- talking head or title card \+ voiceover  
"A retailer in Tamil Nadu restocks his shop by phone. Today he travels without knowing what's in stock. Pickup Ready fixes that \- he speaks his order, and travels only when it's reserved."

\[0:20-1:40\] CORE VOICE FLOW \- screen recording, Call tab (dialer-style)  
1\. On the call screen, the retailer dials the shop's number (dialer UI, ringing tone, connected). The AI answers and greets him by name in Tamil \- this is the phone call, simulated in the browser.  
2\. Speak (Tamil, code-mixed is fine): "Repeat last Monday's list, sugar vendaam, oil rendu tin extra."  
   Show: app finds Monday's order, removes sugar, adds 2 oil tins, resolves brand and pack size from history.  
3\. Force a shortage (order something low-stock). Show: app names one in-stock alternative with brand, pack size, price; accept it by voice.  
4\. Show the vocabulary memory: use a saved alias for one item; mention it was saved after confirmation.  
5\. App reads back products, brands, quantities, pack sizes, prices in Tamil. Say "aama."  
   Show: stock reserved, pickup time confirmed, packing list created.

\[1:40-2:05\] PACKER \+ OWNER \- quick cuts  
\- Packer tab: check items off as packed. Optional: "order 42-la oru oil tin add pannunga" and show the live update.  
\- Owner tab: ask "Indru enna enna kidaikkala?" and show the unmet-demand answer.

\[2:05-2:30\] CLOSE \- voiceover over the bill screen  
"Everything you saw is reserved, packed and billed before the retailer leaves home. Pickup Ready remembers his brands and his words. This prototype shows the call in the browser; the product answers the shop's existing phone line, so the retailer changes nothing about how he orders today."

RECORDING NOTES  
\- If live Tamil speech recognition misbehaves during recording, use the typed-transcript path through the same AI interpreter (the build supports both) and say so in one line on screen. Do not fake a voice pass.  
\- Keep the "Scripted sample, not live AI" fallback out of the main take; if any path uses it, that section's label stays visible. Judges can ask, and an honest label is a strength, not a weakness.  
\- Show real screens only; no mockups.

# pickup-ready-r2-architecture-8d1ea78f.txt

PICKUP READY \- SYSTEM ARCHITECTURE (Nov 27, 2026\)  
Grounded in the submitted Round 1 Activity 2 build spec and the five research docs from today. External claims are attributed; nothing invented.

0\. THE DESIGN RULE EVERYTHING IS CHECKED AGAINST  
Near-zero transition debt. The shop changes almost nothing: same phone number, same ringing phone, same counter, no app to install, no new workflow, no training. The retailer changes literally nothing \- he calls and speaks like he always has.  
Why an app-based approach fails this rule: every installed-app alternative asks both sides to learn a new tool for a job they already do by phone. The wholesale trade runs on informal trust, credit and calls (Springer kirana paper; Redseer AOV Trap kirana-owner quote: when a delivery fails they "just call a nearby wholesaler"). An app inserts itself between two people who already have a working habit, and habit is the whole market. So the architecture takes the calls where they already arrive; technology stays invisible to the humans.  
Check every new idea against the rule: if it adds a step for the retailer or the shop, it goes to the backlog, not the product.

1\. THE THREE LAYERS  
   \[Phone call\] \---\> \[VOICE LAYER: hear and speak\] \---\> \[AI LAYER: understand and propose\] \---\> \[CORE: decide and record\] \---\> \[DATABASE\]  
   The rule that keeps this trustworthy (from the submitted spec): the AI proposes, deterministic code decides. The model never touches stock, reservations or money directly.

   Voice layer: turns speech into text and replies back into speech. Swappable by design.  
   AI layer: interprets the transcript with the catalogue and that retailer's history as context; proposes structured order lines and short Tamil replies. Never executes.  
   Core: deterministic code owns catalogue, stock checks, reservations, shortage handling, bills, packing lists, and every guard in the edge-cases doc.  
   Database: the single record of everything, and the source of every analytics answer (section 4).

2\. DATABASE SCHEMA OUTLINE (prototype and production share this shape)  
   \- retailers: id, name, phone, language preference, notes  
   \- retailer\_aliases: retailer\_id, spoken term, confirmed product \+ pack size, confirmed\_by (retailer or packer), confirmed\_at. Saved ONLY after confirmation; an alias never resolves an ambiguous pack size alone.  
   \- retailer\_brand\_defaults: retailer\_id, product, chosen brand, saved after confirmation  
   \- products (catalogue): id, name, brand, pack size, unit, price, stock, active  
   \- orders: id, retailer\_id, status (draft/confirmed/reserved/packing/packed/billed), pickup time, created from call id  
   \- order\_lines: order\_id, product\_id, qty, unit, price, state (proposed/confirmed/reserved/packed), source (live AI / typed transcript)  
   \- unmet\_demand: retailer\_id, requested term, resolved product if any, flag: out\_of\_stock OR not\_carried, date, outcome (substitute accepted / rejected / none available). The "not\_carried" flag is the one addition beyond the Round 1 spec, from Sanjay's Nov 27 idea.  
   \- restock\_notifications: unmet\_demand\_id, retailer\_id, product\_id, sent\_at (simulated)  
   \- calls: id, retailer\_id, started/ended, transcript reference, completion flag (zero human correction or not)  
   Every analytics answer is computed from these records. The model never invents a total.

3\. THE THREE CLIENTS  
   \- Retailer (the Call): in the prototype, a dialer-style browser screen \- shop number, ringing, in-call transcript, proposed order, confirmations. In production, this client disappears entirely: the retailer just phones the shop.  
   \- Packer: reserved items with pack sizes, unresolved "needs packer check" flags, packed checkboxes; updates live when an order is edited mid-packing.  
   \- Owner: stock view plus the voice-answered questions in section 4\.

4\. THE ANALYSIS LAYER (how we are doing \- answered from records)  
   The seven Owner questions from the insights doc, each a plain query over the tables above:  
   1\. What couldn't people buy today? (unmet\_demand, out\_of\_stock, distinct retailer count per date)  
   2\. What are people asking for that we've never carried? (unmet\_demand, not\_carried, aggregated)  
   3\. Which substitutes get accepted or rejected? (unmet\_demand outcomes)  
   4\. Which brands are retailers switching off? (brand-default change events)  
   5\. Who should hear it's back in stock? (restock\_notifications)  
   6\. How does the neighbourhood actually name things? (retailer\_aliases)  
   7\. When do orders come in? (calls timestamps)  
   Plus the system-health metrics in section 6\.

5\. TECH STACK  
   Prototype (this weekend, per the submitted spec):  
   \- React \+ TypeScript \+ Tailwind, built with an AI app builder (Lovable or Cursor)  
   \- Browser speech recognition (Chrome, ta-IN) for the call audio; typed transcripts through the same interpreter as the supported fallback  
   \- One serverless function (Lovable edge function or Vercel) holding the model API key \- the key never touches the browser; a free-tier Gemini/OpenAI/Anthropic key is enough for demo volume  
   \- GitHub public repo; Lovable publish link or Vercel deploy for the optional live link  
   \- Wispr Flow as the build tool (prompts dictated by voice) and an optional hands-free transcript input path

   Production (the honest "would look like" version):  
   \- Telephony/CPaaS: Exotel or Plivo (Indian virtual numbers; TRAI/DoT KYC with business documents, 1-3 business days verification \- per their docs, fetched Nov 27). The shop's existing number is call-forwarded to the virtual number; the shop keeps its number and its phone. This is the ONLY piece that touches the real world, and it is exactly the piece that failed the 3-day test.  
   \- Speech: Saaras-class Indian-language model. Sarvam's Saaras v4 (docs.sarvam.ai, fetched Nov 27\) covers 22 Indian languages \+ English with a code-mixed output mode, keyterm prompting (the catalogue becomes recognition hints \- exactly what the spec asks for), realtime WebSocket streaming, and accuracy on 8 kHz telephony audio. This is the "adapt, don't train" path from Round 1: model \+ per-shop vocabulary boosting, fine-tuning only as fallback.  
   \- AI interpretation: a hosted LLM with tool-calling, same role as the prototype.  
   \- Core \+ database: Postgres, deterministic services, per-shop isolation. Call audio retention with consent; transcripts and records stay per-shop (privacy line from the insights doc).

   Existing tech we adapt rather than build: browser speech APIs (prototype ASR), Saaras (production ASR), hosted LLMs (interpretation), CPaaS (telephony), Web Speech/TTS for replies where supported. We build only the order-desk core and the per-retailer memory \- the parts that don't exist yet (see the existing-work scan).

6\. MEASURABLE OUTCOMES (honest framing: baselines cited, our numbers measured by the system, not claimed in advance)  
   \- Wasted trips avoided: baseline \- kiranas make 3-5 hour wholesale market trips and coordinate 5-10 distributors (Redseer AOV Trap, Jan 2026); one documented owner shut her shop 3-4 days a month for stock runs (The CapTable, Oct 2023). Our metric: reserved-before-travel confirmations per week; a wasted trip becomes a known-before-leaving call.  
   \- Order accuracy: target from Round 1 \- 80 of 100 live-AI orders completed with zero human correction, counted from calls records, live-AI and scripted results reported separately.  
   \- Demand captured that today dies on the phone: count of not-carried and out-of-stock requests surfaced to the owner per month. Baseline today: zero visibility \- those requests are never recorded anywhere.  
   \- Counter time: pack-ahead orders vs walk-in handling, measured in a pilot; no baseline figure claimed.  
   \- Recognition quality: clarification-question rate and two-strike human-flag rate per 100 calls, by language mix. Improvement path: keyterm boosting with the growing alias table.  
   The rule: the system measures itself from its own records; we never put a market figure in the deck that a report didn't publish.

7\. INSTITUTIONS AND COMPANIES ACTIVE IN THIS AREA  
   Detail in the existing-work scan; one-paragraph map for the deck:  
   \- Voice order desks for distribution: VaaniAI (outbound AI order calls), Custography (voice-first ops layer, Tamil listed, pilot stage)  
   \- WhatsApp/order management: Udyant, VIKMO, FlowKartAI  
   \- FMCG route-to-market agents: PlugDrop.AI  
   \- eB2B supply platforms changing how kiranas restock: ElasticRun, Udaan, DealShare (The CapTable)  
   \- Indian-language speech infrastructure: Sarvam (Saaras), AI4Bharat (open Indic models)  
   None combine spontaneous call-in \+ Tamil code-mix \+ reserve-before-travel \+ per-retailer vocabulary memory. That combination is the product.

8\. DEMO NARRATION BLOCK (read over a simple three-box diagram, \~35 seconds)  
   "Here's the whole system. A retailer phones the shop and speaks Tamil, mixed with English brand names, like always. The voice layer hears him \- in this prototype that's the browser simulating the call; in the product it's the shop's existing number forwarded to an Indian telephony service and a speech model built for Indian languages. The AI proposes an order; it never touches stock or money. The core checks real stock, reserves only on his 'aama', settles shortages while he's still on the line, and hands the packer a list. Everything lands in one database, which is how the owner can ask, by voice, what people wanted that he couldn't sell. The shop changes nothing. That's the architecture, and that's the point."

   Diagram for the video (three boxes, left to right):  
   \[RETAILER'S PHONE CALL\] \--\> \[VOICE \+ AI: hear, understand, propose\] \--\> \[CORE \+ DATABASE: stock, reserve, pack, bill, remember\]  
   Below, two small boxes fed by the database: \[PACKER SCREEN\] and \[OWNER'S QUESTIONS\].

# pickup-ready-r2-wispr-flow-scan-f5ee3cde.txt

WISPR FLOW SCAN \- what carries our prototype (Nov 27, 2026\)  
Sources: wisprflow.ai homepage, /features, /use-cases (fetched Nov 27). Vendor claims marked as such.

WHAT FLOW ACTUALLY IS  
\- A dictation layer, not a telephony or conversational-AI stack: it types wherever your cursor is, in any app or website, with no plugins or integrations (their FAQ: "If you can type there, you can Flow there").  
\- Platforms: Mac, Windows, iPhone, Android. A separate Notetaker product records and summarizes meetings.  
\- Free tier: 2,000 words/week; Pro is unlimited. Hackathon perk is 3 months of Pro (Scaler email, Nov 11).

THE SPEECH MODEL (Canto-2, their claims)  
\- Proprietary model from Wispr Advanced Interfaces Lab.  
\- Vendor claim: lowest word error rate of models they tested on real-world English dictation, including Google Gemini 3.1 Pro and OpenAI GPT Transcribe.  
\- Vendor claim: "leading accuracy in 14 languages" \- the site names Spanish, French, German, Hindi, Mandarin, Korean "and more." Tamil is NOT explicitly named anywhere on the site. Dictation overall is "100+ languages" with auto-detection, so Tamil dictation likely works, but accuracy is unproven \- treat it as test-before-demo, same as the browser speech path.  
\- Their own accuracy tip, quoted for the demo: select the specific language you're speaking rather than auto-detect; having multiple languages selected can confuse it. One-click language switch in the Flow bar.  
\- Handles accents, fast speech, whispering, and background noise (their FAQ). Mic guidance: built-in mic is fine, avoid Bluetooth earbuds (they compress audio and clip the start of speech) \- use this for Sunday's recording.

FEATURES THAT MIRROR OUR DESIGN (useful for the story)  
\- Personal dictionary: Flow learns your words as you correct them; you can add terms manually. This is exactly our per-retailer vocabulary memory at dictation scale \- their existence validates the concept.  
\- Snippets: speak a shortcut, full text expands.  
\- Styles: adapts tone per app (English/desktop only).  
\- Teams: shared dictionary, shared snippets, usage dashboards.  
\- Privacy: data never sold, opt-in improvement sharing; SOC 2 Type II, HIPAA, ISO 27001 certified (their claims).

TOP USE CASES (from /use-cases)  
\- Email and messaging replies by voice, faster inbox clearing.  
\- Talking to AI coding tools (Cursor, Claude) \- prompting and debugging by voice.  
\- Documents and technical writing.  
\- Note capture on the go.

WHAT THIS MEANS FOR PICKUP READY  
1\. Build tool: Sanjay dictates prompts and code instructions to the AI builder with Flow \- this is the "build by voice" theme of the hackathon, worth one line in the deck or demo narration.  
2\. Demo input path: the app accepts typed transcripts through the same AI interpreter as live speech. Flow can type those transcripts hands-free \- a speaker talks in Tamil/English, Flow enters the text, the app interprets. This is a second, reliable way to drive the demo if browser speech recognition is shaky, and it stays honest: the AI interpretation is still live.  
3\. Story tie-in: "Wispr Flow learns your words; Pickup Ready learns each retailer's words, per shop, and only after they confirm the meaning." One slide or narration line, no more.  
4\. Expectation setting: Flow is a sponsor, not our voice stack. Our in-app Tamil understanding comes from the browser speech path \+ the server-side AI interpreter; Flow helps around the edges.

# pickup-ready-r2-edge-cases-e57924da.txt

PICKUP READY \- EDGE CASES AND HOW THE PROTOTYPE HANDLES THEM (Nov 27, 2026\)  
Grounded in the submitted Round 1 Activity 2 build spec. Items marked \[EXTENSION\] go one step beyond the spec, added from Sanjay's Nov 27 request; they are consistent with the spec's rules and cheap to build since they reuse the same unmet-demand record.

SPEECH INPUT PROBLEMS  
1\. Random or irrelevant speech (chit-chat, questions that aren't an order)  
   \- Interpreter returns no order lines; the app replies with one short Tamil question steering back to the order. No state changes, nothing reserved.  
2\. Unclear or misheard input, conflicting matches, missing unit/size  
   \- Ask one short Tamil question. If still unresolved: flag "needs packer check" and tell the retailer a person must confirm. Never guess.  
3\. Silence or heavy noise  
   \- Ask them to repeat. After two failed attempts, flag for a human and keep the pending order safe.  
4\. Code-mixed Tamil-English (the normal way retailers speak)  
   \- Accepted as-is; product names are never translated away. Catalogue vocabulary is supplied to the recognizer as hints where supported.  
5\. Accent or dialect variation  
   \- Recognition and interpretation layers are swappable, so a better Tamil model drops in without redesign. Real product direction: Indian-language speech model \+ per-shop vocabulary boosting, fine-tuning only as fallback.

ORDER CONTENT PROBLEMS  
6\. Item not in the catalogue at all (shop has never carried it) \[EXTENSION\]  
   \- Not the same as out of stock. Recorded as unmet demand with a "not carried" flag, linked to retailer and date. Retailer hears a plain answer ("we don't carry that"); the request feeds the Owner demand signal (see the insights doc).  
7\. Item in catalogue but out of stock  
   \- Name ONE in-stock alternative with brand, pack size and price; wait for acceptance or rejection. Record the unavailable request as unmet demand separately from accepted substitutes.  
8\. Ambiguous brand or pack size ("oil" \- which brand, which tin?)  
   \- Resolve from that retailer's confirmed history; if ambiguous, ask. A saved alias never resolves an ambiguous pack size by itself.  
9\. Quantity confusion (moodai, tin, box have no universal size)  
   \- Use the selected product's catalogue pack size, or ask. No assumed conversions.  
10\. Duplicate lines (same product mentioned twice)  
    \- Merge into one line and read back the combined quantity for confirmation.  
11\. Mid-order correction ("illai" at read-back, or "actually make it 6")  
    \- Ask which line is wrong, correct it, and reconfirm the full corrected order. Corrections are caught, not appended.  
12\. Interruption during read-back  
    \- Treated as a correction trigger; re-read only the affected lines, then continue confirmation.

STATE AND MONEY GUARDS  
13\. Stock changes between read-back and "aama"  
    \- Availability is rechecked at confirmation. If it changed, explain what changed and get a new confirmation before reserving. Stock is reserved only at confirmation.  
14\. Addition mid-packing ("order 42-la oru oil tin add pannunga")  
    \- Confirm the change, recheck and reserve its stock, update the Packer tab live. A billed order is never silently edited.  
15\. Billing with anything unresolved  
    \- Billing is blocked while any line is unconfirmed, unresolved, unreserved or unpacked. One bill, catalogue prices, simulated WhatsApp-style bill with pickup code; no real messages are ever sent.  
16\. AI failure mid-call  
    \- Explain, preserve the pending order, and reserve/bill nothing. Missing AI configuration disables live interpretation instead of silently substituting the scripted sample.  
17\. Repeat-order reference fails ("last Monday's list" but no order that day)  
    \- Ask which order they mean; show the closest dated orders. Never fabricate a repeat.

FIRST-USE AND MEMORY GUARDS  
18\. New retailer, no history  
    \- Brand questions are mandatory on first use of any product; the chosen default is saved only after confirmation.  
19\. Unknown word or new alias  
    \- Look up catalogue terms and that retailer's own aliases first; if unresolved, ask. A new alias is saved only after the retailer or packer confirms product, unit and size. Lookup and saving stay separate operations; memory is always per-retailer.

DEMO NOTE  
The Sunday demo should deliberately show 2-3 of these live (suggested: \#7 shortage settlement, \#8 brand question, \#11 correction) \- judges scoring "error handling" will be looking for exactly this list.

# pickup-ready-r2-voice-data-insights-74760e11.txt

PICKUP READY \- WHAT THE CALLS TEACH THE SHOP (voice-data insights, Nov 27, 2026\)  
Feature story for the Owner side, developed from Sanjay's Nov 27 idea. Grounding rule from the build spec: every number shown comes from recorded events (unmet-demand records, order history, confirmations), never invented by the model.

THE IDEA IN ONE LINE  
Every call leaves a record. Put together, those records tell the owner what the neighbourhood wants \- including what he has never stocked.

THE SIGNALS (each one \= one Owner-tab question, asked by voice)

1\. "What couldn't people buy today?" \- already in the spec  
   "Indru enna enna kidaikkala?" returns unavailable items with distinct retailer counts for a chosen date, calculated from unmet-demand records. Out of stock, not unknown.

2\. "What are people asking for that I've never carried?" \- Sanjay's addition  
   Requests for items absent from the catalogue are logged with a "not carried" flag (edge case \#6). Aggregated: "9 different retailers asked for ragi flour this month; you don't stock it." This is a stocking signal no billing software produces, because today those requests die on the phone call.  
   Owner action: add the product to the catalogue, and the next call for it succeeds.

3\. "Which substitutes do retailers actually accept?"  
   Every shortage offer records accepted vs rejected. If retailers keep rejecting the alternative brand of oil, the owner learns the shelf gap is brand-specific, not product-specific.

4\. "Which brands are retailers switching away from, and why?"  
   Brand-change requests ("the tea I got last time wasn't good, what else?") are recorded with the switch. A cluster of switches off one brand is a quality signal the owner would otherwise hear only at the counter.

5\. "Who should hear that it's back in stock?"  
   Restock events link back to the retailers who asked and couldn't buy (spec step 7). The back-in-stock notification list is itself a demand record: how many retailers were waiting.

6\. "What does each retailer's vocabulary tell me?"  
   Confirmed aliases per retailer form a living map of how the neighbourhood actually names products. Useful for the owner labeling shelves and schemes in the words his customers use.

7\. "When do orders actually come in?"  
   Call timestamps give peak ordering hours and days \- staffing and packing decisions, from records that already exist.

WHY THIS IS DIFFERENT (deck-ready)  
Billing and inventory software sees what was sold. Pickup Ready sees what was ASKED. The difference between sold and asked \- out-of-stock requests, never-carried requests, rejected substitutes \- is invisible to every system the shop runs today. Voice is what captures it, because the asking happens by voice.

BOUNDARIES (keep the story honest)  
\- All figures are computed from recorded call events; the model never invents totals.  
\- Everything is per-shop: one shop's call data is its own. No claims about market-wide analytics.  
\- "Not carried" is distinct from "out of stock" in the data model \- confusing them is what makes ordinary systems blind to new demand.  
\- Privacy note worth one line: retailers' orders and words belong to the shop; the prototype has no third-party sharing anywhere in the design.

PROTOTYPE SCOPE FOR SUNDAY  
Owner tab needs only signal \#1 (already in spec) plus signal \#2 as the headline addition \- it is the one Sanjay described, it reuses the unmet-demand record with one extra flag, and it demos well: "Ask the shop what people want that it doesn't sell."

# pickup-ready-r2-existing-work-scan-1537e921.txt

PICKUP READY \- EXISTING WORK SCAN (Nov 27, 2026\)  
What's been built near our idea, what they do, and the gaps we fill. Every vendor claim below is from that vendor's own site (fetched Nov 27\) and is their marketing, not independently verified. Context stat from the Scaler/Wispr launch press release (ptinews.com, Nov 18): per the IAMAI-Kantar report, one in five internet users in India already uses voice commands.

1\. VaaniAI (vaaniai.io) \- AI phone agents for distributors  
   \- What they do: AI calls retailers on order day, takes the order item by item, reads it back for confirmation, pushes to CRM/ERP via webhooks; payment reminders and scheme announcements. Hindi \+ English listed. Dedicated Indian numbers. Free trial (3 days or 25 calls), then from Rs 9,999/month.  
   \- What validates us: phone-call ordering with read-back confirmation is a real, sold product category \- our core flow is not exotic.  
   \- Gap we fill: their agent calls OUT on a schedule; the retailer's own spontaneous call-in, per-retailer vocabulary memory, and the reserve-before-travel guarantee are not their pitch. Tamil not listed.

2\. Custography (custography.com) \- voice-first ops layer for stockists and kiranas  
   \- What they do: understands calls, WhatsApp, voice notes and documents in Kannada, Hindi, Telugu, Tamil, Malayalam and code-mixed speech; extracts intents and draft orders; human approval for anything financial; orchestrates on top of the existing ERP. Currently pilot/waitlist only.  
   \- What validates us: their design rule "conversation is an input, not authority" is exactly our AI-proposes / code-decides split. Tamil \+ code-mixed listed \- confirms the language need is real.  
   \- Gap we fill: not publicly available; targets the stockist's whole back office, not the retailer's never-wasted trip. No per-retailer word learning in their pitch.

3\. Udyant (udyant.com) \- WhatsApp order management for distributors  
   \- What they do: parse WhatsApp messages (text, voice notes, photos) in Hindi/Hinglish/English into orders; credit-limit hard blocks; GST invoices; schemes auto-apply. Free tier 50 orders/month. Their claim: 95%+ parsing accuracy, order created in under 30 seconds.  
   \- Gap we fill: WhatsApp-first, not a live phone conversation; Hindi-centric; ordering still means sending a message into a queue, not settling stock on a call.

4\. VIKMO (vikmo.app) \- AI-native multi-channel seller platform  
   \- What they do: WhatsApp AI agent, dealer portal, counter POS, voice-note and photo order intake, Tally/Zoho sync. Backed by MeitY Startup Hub, IIT Kanpur SIIC, NSRCEL (their site). Built inside a real 12,000-SKU business since 2017\.  
   \- Gap we fill: breadth-first operations suite; live voice conversation in Tamil is not the front door.

5\. PlugDrop.AI (plugdrop.ai) \- AI agents for FMCG route-to-market  
   \- What they do: retailers reorder on WhatsApp or by voice between rep visits; beat planning for reps; shelf-audit photos; scheme rollout in local languages; writes into the distributor's DMS/ERP.  
   \- Gap we fill: brand/distributor-side tooling aimed at coverage between rep visits; the retailer's trip and the shop's own demand intelligence aren't the product.

THE GAPS, PUT TOGETHER (our differentiators, deck-usable)  
a. The retailer changes nothing. Every product above asks the retailer to message, install, or wait for a scheduled call. Ours answers the call the retailer already makes.  
b. Reserved before travel. None of them stake the trip: stock is confirmed and reserved on the call, so the retailer never travels to hear "ille."  
c. The shop learns each retailer's words. Vocabulary memory, saved only after confirmation, per retailer. None of the five pitch this.  
d. Tamil-first with code-mixing. Only Custography lists Tamil, and it's in pilot. The others lead with Hindi/Hinglish.  
e. Asked-vs-sold intelligence. Their data sees orders placed; ours also sees demand that failed \- out-of-stock and never-carried requests (see the insights doc).

FEATURES WORTH BORROWING (post-hackathon backlog, not for Sunday)  
\- Read-back confirmation before committing (VaaniAI does this too \- it validates ours; keep).  
\- Human approval for financial or risky actions (Custography) \- matches our billing guard; keep.  
\- Credit-limit blocking before confirming an order (Udyant) \- real wholesale workflows need it.  
\- Scheme announcements and price-change broadcasts (VaaniAI, Udyant) \- natural outbound use of the same voice channel.  
\- ERP/Tally sync (all four commercial ones) \- the integration story for a real launch.

HONEST POSITIONING LINE  
"We're not the first voice-ordering idea \- VaaniAI, Custography, Udyant, VIKMO and PlugDrop all work near this space. We're the one that keeps the retailer's habit exactly as it is: call, speak, hang up, and travel only when the bag is reserved."

# pickup-ready-r2-wholesaler-side-research-37979d3c.txt

THE WHOLESALER SIDE OF THE COUNTER \- desk research (Nov 27, 2026\)  
Who buys from wholesale provisions shops, how those relationships run today, and where a voice order desk grows the business instead of just taking orders. All claims sourced; vendor/report claims attributed. No invented figures.

WHO THE WHOLESALER'S CUSTOMERS ACTUALLY ARE  
Sanjay's read is confirmed by sources:  
\- Small retailers/kiranas are the core. Rural and small-town retailers visit wholesale markets in nearby towns themselves; distributors' direct channels reach only about 20-30% of kirana stores, leaving the rest to wholesalers (Springer, "Online Retailing Paired with Kirana", doi.org/10.1007/s40547-015-0057-9).  
\- The mix is wider than kiranas: wholesale grocery sellers explicitly serve kirana stores, retailers and supermarkets, hotels, restaurants and caterers, and institutions \- canteens, hostels, offices \- as distinct buyer types (siridhaniya.com, wholesale FMCG seller, fetched Nov 27).  
\- The trips are real costs: kiranas coordinate across 5-10 distributors and make 3-5 hour market trips, which eB2B platforms are only beginning to reduce (Redseer, "The AOV Trap", Jan 2026). A Maharashtra kirana owner describes shutting her shop 3-4 days a month to travel 60 km for stock before switching to an eB2B agent (The CapTable on ElasticRun, Oct 2023).

HOW THE RELATIONSHIP RUNS TODAY  
\- Informal and personal: arrangements between wholesalers and kiranas are mostly informal, with cash payment common; established brands sell on advance payment or cash, the rest on credit or consignment, with credit periods from 1 week to 2 months (Springer paper above).  
\- Trust and credit are the glue: kiranas win households through "personalised service and trusted credit" (Redseer AOV Trap) \- and the same credit logic runs one level up between wholesaler and retailer.  
\- Phone is already the channel: when a delivery is delayed, owners "just call a nearby wholesaler or another kirana we know" (kirana owner quote, Redseer AOV Trap). The call is the existing workflow \- our product's foundation, not our invention.  
\- Margins are thin: FMCG distribution runs at roughly 4-6% at the distributor level (The CapTable), so growth has to come from keeping and serving more buyers, not from raising prices.

THE "ONE-STOP" POSITIONING  
Wholesale sellers position exactly this way: everything a business buyer needs in one order, one place, with flexible payment (siridhaniya.com). The voice desk strengthens it: a retailer who can ask "do you have X?" by voice and get an instant, correct answer \- even for rarely-asked items \- experiences the shop as one-stop without the owner hiring more counter staff.

WHERE A VOICE ORDER DESK GROWS THE BUSINESS (feature ideas, deck-usable)  
1\. Retention at the failure moment. Today, when stock fails, the retailer tries the neighboring wholesaler on the same trip (the Redseer quote shows this is normal). Settling the shortage on the call \- or telling him before he travels \- keeps the sale and the relationship with THIS shop.  
2\. More counter capacity at peak. Orders phoned ahead and pre-packed mean the morning rush serves more retailers per counter hour; the packer list is the mechanism (already in the build).  
3\. Demand signals for stocking. "Asked but never carried" requests tell the owner what to start stocking \- revenue the shop currently never sees (full story in the insights doc).  
4\. Institutional buyers fit voice best. Hostels, caterers and canteens place big, repeating lists on a schedule \- exactly the "repeat last list with edits" flow, and exactly the buyers where a missed item costs the most.  
5\. Credit handled on the call (backlog idea). Outstanding-balance reminders and credit-limit checks at order time \- the same workflow Udyant and VaaniAI sell separately \- fold naturally into the order call later.  
6\. A free upsell channel (backlog idea). New arrivals and scheme announcements when regulars call in \- the wholesaler's equivalent of VaaniAI's scheme broadcasts, without outbound campaigns.  
7\. Back-in-stock pull. Notifying the retailers who asked for an unavailable item when it returns (already in the spec) converts a failed call into the next visit.

POSITIONING LINE FOR THE DECK  
"Pick up any wholesale shop's phone bill: the orders already arrive by voice, the regulars already run on trust and credit, and the one-stop promise already exists. Pickup Ready doesn't change what the shop is \- it makes the phone finally keep up with it."  
Sources: Redseer AOV Trap (redseer.com PDF, Jan 2026); Springer retail-kirana paper (doi.org/10.1007/s40547-015-0057-9); The CapTable on ElasticRun (Oct 2023); siridhaniya.com. Round 1 sources still apply for market size: Redseer hybrid-retail digest (13-14M kirana, 85-90% traditional trade) and McKinsey State of Grocery Retail in India (2022).

# pickup-ready-r2-alias-and-platform-questions-cac441d7.txt

PICKUP READY \- TWO HARD QUESTIONS, ANSWERED (Nov 27, 2026\)  
Sanjay's voice note: (1) how do we handle words like "Florence kilo" meaning ice bag 15 kg \- train something or not, and what existing work does this; (2) how are we different from ElevenLabs/Sarvam agent platforms that give you a voice model \+ knowledge base \+ prompting today. Everything cited; vendor claims attributed.

\================================================================  
PART 1 \- THE ALIAS PROBLEM: DATA, NOT TRAINING  
\================================================================

WHAT THE PROBLEM ACTUALLY IS (three different cases, one mechanism)  
a. Colloquial/local names: "Florence kilo" \= ice bag 15 kg. A word that exists nowhere in the catalogue.  
b. Brand-as-generic: the brand name used as the product type. This is a documented Indian market phenomenon \- marketing literature calls it trademark genericization and studies Indian cases specifically (Indian Journal of Marketing, 2010). Every shopkeeper knows the pattern: customers ask for the brand, mean the category.  
c. Abbreviations and jargon: shortened or code-mixed forms of catalogue names.  
All three are the same mechanism: the buyer's word and the catalogue's word differ, and the mapping is real knowledge that exists in the shop's head today.

WHAT EXISTING WORK SAYS (ecommerce search has solved this for 20 years)  
\- Explicit synonym tables are the industry-standard mechanism, and they remain primary even in the vector-search era: "Vectors do not remove the need for synonyms. They reduce it. Trade abbreviations, brand shorthand, old and new product names are still best handled by explicit rules, because you can read, test and reverse them." (B2B product search engineering practice, balazscsorba.com)  
\- The best source of new synonyms is the log of failed matches, reviewed regularly \- decide for each whether it's a missing synonym, a missing product, or something you don't sell (same source). This is exactly our unmet-demand \+ unresolved-word record.  
\- Standard merchandising practice: map brand names and abbreviations to full names, map product nicknames, include regional jargon, and keep updating from real usage (Adobe Commerce synonym best practices).  
\- Voice adds one twist: the word must first be HEARD correctly. Recognition and meaning are two layers. Saaras v4 supports keyterm prompting \- the catalogue and known aliases become recognition hints (docs.sarvam.ai, fetched Nov 27). Keyterms improve hearing; the alias table decides meaning. Never merge the two.

THE RECOMMENDATION (fits the submitted spec; no model training)  
1\. Shop-level aliases: every product carries alias rows, seeded from the shop's own price list and the words counter staff already use.  
2\. Retailer-level aliases: per-retailer, saved ONLY after confirmation (already in the spec). "Florence kilo" gets asked once \- "Florence \- ice bag, 15 kg pack, correct?" \- and never asked again for that retailer.  
3\. Resolution order: catalogue terms \-\> that retailer's confirmed aliases \-\> ask one short Tamil question \-\> after two failures, flag "needs packer check". Never silently map. An alias never resolves an ambiguous pack size by itself (spec rule).  
4\. Growth loop: every unresolved word lands in the unmet/unresolved record; reviewing it weekly is the shop's vocabulary growth \- the same zero-result-log ritual ecommerce search teams use, done by the shop owner instead of a search team.  
5\. Training is the fallback for a different problem: only if a word is consistently misHEARD (recognition failure, not meaning failure) does model-level adaptation enter the picture \- and per Round 1's "adapt, don't train" decision, per-shop vocabulary boosting comes first, fine-tuning last.  
Why not training: a fine-tuned model bakes in yesterday's vocabulary, the shop can't inspect or reverse it, and it confuses hearing with meaning. Alias tables are readable, testable and reversible \- which is why the industry keeps them even with far bigger AI budgets than ours.  
What competitors do: Custography extracts product/SKU with a confidence score and routes low-confidence cases to human approval; Udyant parses brand-named orders like "50 Tata Salt bhej do" (their own example). Nobody advertises per-retailer, confirmation-gated vocabulary. That gap is ours.

\================================================================  
PART 2 \- "CAN'T YOU ALREADY BUILD THIS WITH ELEVENLABS OR SARVAM?"  
\================================================================

WHAT THE PLATFORMS ACTUALLY PROVIDE TODAY (checked live, Nov 27\)  
\- ElevenLabs ElevenAgents: conversation workflows, system prompts, choice of LLM, knowledge bases, telephony/web/mobile deployment, monitoring and evals (elevenlabs.io/docs/eleven-agents/overview). Their Eleven v4 TTS family covers 90+ languages including Tamil (their docs).  
\- Sarvam Voice Agents: "Genie" builds an agent conversationally, branching call flows, tools and API connections, and "rent a number with KYC or bring your provider" (sarvam.ai/products/voice-agents).  
So yes, honestly: today anyone can prompt a voice agent, attach a catalogue as a knowledge base, and it will TALK like an order desk. Pretending otherwise in front of judges would be a mistake. The answer is what happens after the talking.

WHERE THE PROMPTED AGENT BREAKS (each point maps to a scored part of our build)  
1\. A knowledge base is retrieval, not transactional state. It can answer "do you carry sunflower oil" from documents. It cannot reserve stock atomically, recheck availability at the moment of "aama", block billing while a line is unconfirmed, or hold a pending order safe when the AI fails. State needs code and a database \- that is our core.  
2\. Prompting puts the model in charge of money and inventory. A prompted agent that hallucinates a reservation sends a retailer on a wasted trip \- the exact harm Pickup Ready exists to prevent. Our rule exists for this reason: the AI proposes, deterministic code decides. Judges scoring error handling will ask exactly this.  
3\. No per-retailer, confirmation-gated memory. Platform "memory" is generic conversation context or a shared KB, not "Florence kilo means ice bag 15 kg for THIS retailer, saved after he confirmed it." Part 1 is the whole answer, and no prompt writes it for you.  
4\. The workflow clients don't exist on those platforms. Packer screen with live edits, owner analytics, unmet-demand records, back-in-stock pull \- you'd build all of it as custom tools and a backend anyway. Once you're building that, the platform is supplying the voice layer and nothing more.  
5\. The edge cases are logic, not prompt text. Shortage settlement on the call, mid-packing additions with re-reservation, two-strike human flagging, billing guards \- 19 cases, each a state rule, none expressible as a system prompt you can trust.  
6\. India plumbing is still on you. Sarvam's own page says "rent a number with KYC" \- the telephony reality from this morning applies to them too. And conversational quality in code-mixed Tamil on a global TTS/STT stack versus an Indic model is an evaluation question, not a given.

THE HONEST FRAMING (use this with judges)  
ElevenLabs and Sarvam sell the voice layer the way AWS sells servers. Nobody asks how a shop app is different from AWS. Our production architecture is explicitly built ON that layer \- a Saaras-class Indic speech model plus an Indian CPaaS number. We compete with none of it. The product is everything behind the call: live stock, reservation, per-retailer memory, the packer flow, unmet-demand intelligence, and zero-transition deployment on the shop's existing number. A prompted agent with a knowledge base gets you a convincing conversation \- the easy 20%. The other 80% is the product, and it's the part that makes the conversation safe to act on.

DECK/Q\&A NOTE  
Slide 8's three-box diagram already shows this split visually. Add this to speaker-prep: if a judge says "ElevenLabs could do this", the answer is "they do the left two boxes; we are the third box \- and the third box is what makes the first two safe."

