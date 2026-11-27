# Pickup Ready: how everything fits (branch feat/live-voice)

Written for a developer opening this repo for the first time. Read this first.

## What it is
A voice order desk for Tamil wholesale provisions shops. A retailer talks (Tamil, Tanglish, mixed). The AI talks back and takes the order. Nothing is reserved until the AI judges that the retailer clearly agreed to the read-back (aama, sari, ok, any wording). Then stock is reserved and the order goes to a packer queue, so the retailer only travels when the order is ready.

Round 2 theme: Scaler x WisprFlow, voice-first product. Deadline Nov 30 11:59 PM IST.

## The one idea: AI is the voice, code is the hands
```
 retailer speech
      |  Chrome ta-IN speech-to-text (browser)
      v
 text --> Agent (Gemini, function calling)  <-- the AI conversation layer
              |  asks for facts / actions only through TOOLS
              v
        tools.js  --> Desk (desk.js)  --> SQLite   <-- the deterministic function layer
              |
 reply text <-- Agent  --> browser speechSynthesis (Tamil voice), sentence by sentence
```
The model never sees a price, a stock number or a total unless a tool returned it. It cannot reserve stock or save a word on its own. Those checks live in plain code (`tools.js` gates, `desk.js` logic). So a wrong or fancy model answer cannot silently create a wrong order. That is why the "zero silent wrong guesses" claim is testable: it is a property of code.

## Files
| File | Role |
|---|---|
| `app/server/index.js` | HTTP server (zero dependencies, Node 22). `createApp(db, llm, hasKey)`. Routes: `/api/state`, `/api/agent/turn`, `/api/transcripts`, `/api/orders`, `/api/memory`, `/api/owner`, `/api/restock`, `/api/notifications`, `/api/config`, `/api/reset`, `/api/health`. |
| `app/server/agent.js` | `Agent`: system prompt (Tamil, short sentences, tool-only facts), per-retailer session, tool loop (max 6 model rounds per turn), transcripts, bounded caller context. |
| `app/server/live.js`, `app/public/live.js` | Path B: Gemini Live relay (server) and mic/playback (browser). |
| `app/scripts/spike.js` | Lists the models a key can call. |
| `app/server/llm.js` | Gemini REST client with function calling. Model id from `GEMINI_TEXT_MODEL`. |
| `app/server/tools.js` | Tool declarations the model may call, and `runTool`, which enforces the gates. |
| `app/server/desk.js` | The Desk: catalogue, matching, reserve, pack, restock, insights, suggestions, recent orders. All money/stock logic. Also holds an older scripted state machine kept only because the eval harness and desk tests use it. |
| `app/server/db.js`, `seed.js` | SQLite schema (built-in `node:sqlite`) and demo data. |
| `app/server/interpreter.js` | Older rule-based order parser used by the scripted path. |
| `app/public/` | Plain HTML/JS UI: Call, Packer, Owner tabs, trace panel, learned panel, transcripts. |
| `app/eval/run.js` | Deterministic evaluation harness. |
| `app/server/*.test.js` | Tests (`node:test`). |

## Tools the AI can call
`lookup_item`, `get_last_order`, `find_alternative`, `propose_order`, `confirm_order`, `end_call`, `cancel_order`, `save_word`, `remember_brand`, `report_not_carried`.

Gates enforced in code (not in the prompt). Honest limit: whether the retailer really agreed is the model's judgment (checked in live runs, not provable in unit tests); the code guarantees the structure around it.
- **AI-judged confirmation + `confirm_order` tool.** No word list. After reading the order and total back, the AI decides from the retailer's natural reply whether they clearly agreed (aama, sari, ok, correct, hmm-then-yes handled by judgement). Only then does it call `confirm_order` with the retailer's words in `retailer_said`. Unclear or no answer means the AI asks again; it never guesses a yes. Code enforces the structure, not the language: there must be a pending order, confirming words, and at least one new retailer message since the read-back (so the AI cannot propose and confirm in one breath). Reserve is impossible any other way (fail closed). Rationale: the "did they agree" judgment is the model's, because real shopkeepers won't say one magic word; the money and stock effect is still only reachable through the tool.
- `save_word` follows the same pattern (ask, wait for a reply, then call with their words).
- `end_call`: the AI calls it when the order is done and it has said goodbye, or when the retailer says bye or wants to stop. Path A stops listening and shows "Call ended" after the goodbye is spoken. Path B closes the Live session after the goodbye turn completes. An unconfirmed pending order is dropped, not reserved.
- `remember_brand` needs the retailer to have named the product.
- Stock is checked in code. Out-of-stock and short-stock lines are rejected and logged as unmet demand (deduped).
- Unknown word: `lookup_item` returns `unknown`, never a guess.

## Vocabulary and brand learning
When a retailer uses a word the catalogue does not know ("vellai" for sugar), the AI asks what they mean. Only after the retailer's reply (judged by the AI) does `save_word` store it in `vocab_memory`, per retailer. Another retailer is asked again. Brand choices (which tea they usually mean) go to `brand_memory` and are not asked twice.

## Similar-item suggestion
If `lookup_item` finds nothing, `Desk.suggest()` ranks real, in-stock catalogue rows by trigram similarity on names and aliases (threshold 0.35). The tool result carries `suggestions`; the prompt tells the AI to offer only those, as a question ("X illa, Y irukku, Y venuma?"). If nothing is close, the list is empty and the AI says it is not carried. It cannot invent a product because it only has rows the database returned. Out-of-stock items are never suggested.

## Past-order context
Two mechanisms, both bounded:
1. `Agent.context()` appends to the system prompt each turn: caller name and town, last 3 orders (lines), up to 10 learned words and 10 usual brands, all from SQLite. It says this is background only; stock, prices and totals still come from tools.
2. `get_last_order` tool returns the most recent order with current price and stock. "Same as last time" means: call it, then `propose_order` with those lines, read back, wait for the retailer's confirmation.
Orders count only when status is reserved or billed.

## Transcripts and storage
SQLite file in the app data dir. Tables: `products`, `retailers`, `brand_memory`, `vocab_memory`, `orders`, `order_lines`, `unmet_demand`, `call_transcripts` (both sides of every turn), `notifications`. `/api/transcripts` and the "Show call transcripts" button read them.

## Insights layer
Computed from the same tables, no AI: unmet demand ranking (what retailers asked for that we lacked), restock suggestions, and back-in-stock notifications (restock a product in the Owner tab and every retailer who asked for it gets one message).

## Evaluation harness
`cd app && node eval/run.js` runs hand-labelled scenarios through the deterministic desk and checks invariants (no order before a confirmation tool call, stock drops exactly by the ordered qty, "illa" reserves nothing, no negative stock, brand asked once, words saved only after yes and per retailer). Metrics are code, with hand-written labels, no AI judge. Honest limits: it is in-sample on a small set, and it covers the decision layer only. It does not measure free speech recognition or Gemini's Tamil quality. See `docs/evaluation/SYSTEM_EVALUATION.md`.

## Voice paths
- Path A (built): Chrome ta-IN speech-to-text, Gemini text function calling, browser speechSynthesis. One key, `GEMINI_API_KEY`. Headset checkbox allows barge-in; stale replies are dropped by generation id.
- Path B (built; verified once against a real AI Studio key on Nov 27: Tamil transcripts, tool calls and the confirmation gate worked end to end; the browser mic/playback is still untested): Gemini Live native speech-to-speech. Browser (`public/live.js`) captures mic audio with an AudioWorklet, downsamples to 16 kHz PCM and POSTs ~100 ms chunks to `/api/live/audio`. `server/live.js` relays them to a Gemini Live WebSocket (Node 22's built-in `WebSocket`, no npm dependency), asks for Tamil (`ta-IN`) audio replies, and streams 24 kHz PCM back to the browser over server-sent events (`/api/live/events`), where it is played gaplessly. Barge-in: Gemini's `interrupted` event stops playback. Setup message carries the same system prompt, caller context and tool declarations as Path A.
  - Same tools, same gates: Live `toolCall`s run through `runTool`. Each retailer utterance (Gemini's input transcription) counts as a new turn; `confirm_order` needs a turn after the read-back. With no retailer speech at all, confirm is refused.
  - Both sides of the call are written to `call_transcripts`.
  - Start it with the "Live voice call" button on the Call tab. Needs a key.
  - Verified models (AI Studio key, Nov 27): text `gemini-3.5-flash-lite` (about 1 to 2 s per turn; `gemini-3.5-flash` works but took 10 to 40 s; `gemini-2.5-flash` returns 404 for new users), Live `gemini-3.1-flash-live-preview` and `gemini-3.8-live` (both accept `ta-IN`; `gemini-2.5-flash-native-audio-latest` rejects `ta-IN`). Free tier is limited to about 15 text requests per minute.
  - Still unverified: browser mic and playback, speaker echo handling, docker compose on a real machine.
  - Path A vs B: A is easier to debug and always has a text trace; B is lower latency and sounds more natural; its turn counting depends on Gemini's input transcription.

## Run it
```
docker compose up --build        # http://localhost:3000, no .env needed
```
Without a key the Call tab shows "key not set". With a key: copy `.env.example` to `.env`, set `GEMINI_API_KEY` and `GEMINI_TEXT_MODEL` and `GEMINI_LIVE_MODEL` only if you want other models (defaults are verified). The key stays server-side.

Tests: `cd app && node --no-warnings --test server/*.test.js` (Node 22). Eval: `cd app && node --no-warnings eval/run.js`.

## Not yet verified by anyone (be aware)
Real `docker compose up --build` on a real machine, Chrome's Tamil mic, a Tamil system voice, Tamil prompt quality over many calls. Unit tests use a mock model; one real-key run is described above.

## Branches
- `main`: docs only. Do not touch.
- `feat/scaffold`: frozen scripted-path build (PR #1, draft).
- `feat/live-voice`: this branch. Scripted chat removed from the UI, AI call path added.
