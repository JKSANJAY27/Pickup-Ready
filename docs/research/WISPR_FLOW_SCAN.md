# Pickup Ready — Wispr Flow Scan

> Source: `pickup-ready-r2-wispr-flow-scan-f5ee3cde.txt` (Nov 27, 2026)
> Sources: wisprflow.ai homepage, /features, /use-cases (fetched Nov 27). Vendor claims marked as such.

---

## What Wispr Flow Actually Is

- A **dictation layer**, not a telephony or conversational-AI stack: it types wherever your cursor is, in any app or website, with no plugins or integrations.
  > *Their FAQ: "If you can type there, you can Flow there."*
- **Platforms:** Mac, Windows, iPhone, Android. A separate Notetaker product records and summarizes meetings.
- **Free tier:** 2,000 words/week. Pro is unlimited. Hackathon perk: **3 months of Pro** (Scaler email, Nov 11).

---

## The Speech Model — Canto-2 (Vendor Claims)

- Proprietary model from Wispr Advanced Interfaces Lab.
- Vendor claim: lowest word error rate of models they tested on real-world English dictation, including Google Gemini 3.1 Pro and OpenAI GPT Transcribe.
- Vendor claim: "leading accuracy in 14 languages" — the site names Spanish, French, German, Hindi, Mandarin, Korean "and more."
- **Tamil is NOT explicitly named** anywhere on the site. Dictation overall is "100+ languages" with auto-detection, so Tamil dictation likely works, but accuracy is unproven.

> [!WARNING]
> Treat Tamil in Wispr Flow as **test-before-demo**, same as the browser speech path. Do not assume it works without testing.

- **Accuracy tip (their own, relevant for demo):** Select the specific language you're speaking rather than auto-detect; having multiple languages selected can confuse it. One-click language switch in the Flow bar.
- Handles accents, fast speech, whispering, and background noise *(their FAQ)*. Mic guidance: built-in mic is fine; **avoid Bluetooth earbuds** (they compress audio and clip the start of speech).

---

## Features That Mirror Our Design

| Wispr Flow Feature | Pickup Ready Parallel |
|--------------------|-----------------------|
| Personal dictionary: Flow learns your words as you correct them; add terms manually | Per-retailer vocabulary memory — their existence validates the concept |
| Snippets: speak a shortcut, full text expands | "Repeat last Monday's list" shortcut |
| Teams: shared dictionary, shared snippets, usage dashboards | Per-shop vocabulary (different scope, same idea) |
| Privacy: data never sold, opt-in improvement sharing; SOC 2 Type II, HIPAA, ISO 27001 | Retailer data stays per-shop |

---

## What This Means for Pickup Ready

| Use | Description |
|-----|-------------|
| **Build tool** | Sanjay dictates prompts and code instructions to the AI builder with Flow — this is the "build by voice" theme of the hackathon (worth one line in the deck or demo narration) |
| **Demo input path** | The app accepts typed transcripts through the same AI interpreter as live speech. Flow can type those transcripts hands-free — a speaker talks in Tamil/English, Flow enters the text, the app interprets. This is a second, reliable way to drive the demo if browser speech recognition is shaky, and it stays **honest**: the AI interpretation is still live |
| **Story tie-in** | *"Wispr Flow learns your words; Pickup Ready learns each retailer's words, per shop, and only after they confirm the meaning."* One slide or narration line, no more |
| **Expectation setting** | Flow is a **sponsor, not our voice stack**. Our in-app Tamil understanding comes from the browser speech path + the server-side AI interpreter; Flow helps around the edges |

---

## Top Wispr Flow Use Cases (from /use-cases)

- Email and messaging replies by voice, faster inbox clearing
- Talking to AI coding tools (Cursor, Claude) — prompting and debugging by voice
- Documents and technical writing
- Note capture on the go
