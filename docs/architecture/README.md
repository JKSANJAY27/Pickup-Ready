# Architecture — Overview

This folder contains the full system architecture for Pickup Ready.

## Purpose for AI Agents

Read [ARCHITECTURE.md](./ARCHITECTURE.md) to understand:

- The three-layer design (Voice → AI → Core → Database) and the golden rule that governs all of it
- The complete database schema (all tables, columns, relationships, constraints)
- The three client views (Call tab, Packer tab, Owner tab) and what each does
- The analysis layer (seven Owner questions and how each maps to a DB query)
- The full tech stack for both prototype and production
- The downstream dependencies diagram (Slide 8 of the pitch deck)

## The Golden Rule

> **The AI proposes; deterministic code decides. The model never touches stock, reservations, or money.**

Every architectural decision is checked against this. If a feature proposal violates it, it goes to the backlog.

## Near-Zero Transition Debt

The second design constraint (after the golden rule):

> **The shop changes almost nothing. The retailer changes literally nothing.**

If a proposed feature adds a step for the retailer or the shop → backlog, not product.
