# Evaluation Harness — Overview

This folder contains the full set of edge cases, guard rules, and acceptance test criteria for the Pickup Ready agentic AI system.

## Purpose for AI Agents

When building, testing, or reviewing any part of the Pickup Ready system, **read [EVALUATION.md](./EVALUATION.md) first**. It defines:

1. **19 specific edge cases** the system must handle — grouped by category:
   - Speech input problems (cases 1–5)
   - Order content problems (cases 6–12)
   - State and money guards (cases 13–17)
   - First-use and memory guards (cases 18–19)

2. **The acceptance test suite** (Sunday freeze checklist): repeat/edit, shortage, mid-packing addition, packing, billing, owner totals — live-AI vs scripted reported separately.

3. **Guard rules** that are non-negotiable and map directly to deck claims. If a guard is missing from the code, it must be cut from the deck.

## Key Principle

> The AI proposes; deterministic code decides. No guard is a "prompt" — each is a state machine transition in the core.

## Demo Note

The Sunday demo should deliberately show 2–3 edge cases live:
- **#7** — shortage settlement
- **#8** — brand question
- **#11** — mid-order correction

Judges scoring "error handling" will be looking for exactly this list.
