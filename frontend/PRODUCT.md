# PRODUCT.md

## What this is

**Multi-Agent Newsroom** — an AI *workflow engine* (not a chatbot) that turns a topic into a fact-checked, citation-backed, SEO-optimized article by running it through a pipeline of single-responsibility agents: Research → Fact Checker → Editor → SEO → Publisher → Evaluator.

## Register

`product` — design serves the task. The core surfaces are a tool: a creation form, a live agent dashboard, an article viewer, and history. One `brand` surface: the landing page (design IS the pitch).

## Who uses it

Engineers and content operators evaluating AI workflow quality. They want to *watch the machine think* — which agent is running, what it found, what it cost, how good the result scored. Trust comes from observability and restraint, not decoration.

## Surfaces

- **Landing** (`/`) — brand. Monumental headline on white canvas, a dark agent-console mockup carrying the energy, deep-green CTA band. Sells "watch agents collaborate."
- **Dashboard** (`/dashboard`) — the command center. Agent timeline, progress, metrics (sources, tokens, cost), evaluation score, errors.
- **Create Article** (`/create`) — topic + type + audience form, kicks off a run.
- **Article Viewer** (`/articles/:id`) — rendered markdown article with references and evaluation panel.
- **History** (`/history`) — saved runs, searchable, with status + score.
- **Settings** (`/settings`) — model, search, and key configuration.

## Design system

Follows `DESIGN.md` (Cohere 2026): white editorial canvas, near-black `#17171c` pill CTAs, deep-green `#003c33` feature bands, coral `#ff7759` editorial accents, hairline borders, generous whitespace, no heavy shadows. Type split: Space Grotesk (display, carved/monospace-spirit) + Inter (UI/body) + IBM Plex Mono (uppercase system labels — agent names, status, metrics). Proprietary Cohere fonts aren't bundled; these are the documented fallbacks.

## Non-negotiables

- Every interactive component ships default/hover/focus/active/disabled/loading where it applies.
- Empty states teach the interface, not "nothing here."
- Body contrast ≥ 4.5:1. No light-gray-on-tint.
- Phase 1 is shell + placeholder UI only — no backend wired yet.
