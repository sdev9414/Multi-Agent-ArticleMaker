# Project Overview

**Multi-Agent Newsroom** is an AI workflow engine. Given a topic, a pipeline of single-responsibility AI agents collaborates to produce a fact-checked, citation-backed, SEO-optimized article.

This is not a chatbot — it is a deterministic, observable workflow.

## Goal

Demonstrate production-quality AI engineering: modular architecture, observable agent execution, explainability, and scalability.

## Architecture

```
React frontend
   ↓ HTTP
Express backend        gateway · auth · article CRUD · export · MySQL
   ↓ HTTP (FASTAPI_URL)
FastAPI AI service     LangGraph orchestration · agents · search · evaluation
   ↓
LangGraph workflow → Research → Fact Checker → Editor → SEO → Publisher → Evaluator
   ↓
MySQL                 users · articles · sources · agent_runs · evaluations · article_versions
```

Each agent has exactly one responsibility and communicates only through shared workflow state. Agents never mutate fields they don't own.

## Build plan (phases)

| Phase | Deliverable |
|------:|-------------|
| 0 | Project setup — folders, env templates, docs |
| 1 | React frontend shell (pages, layout, routing) |
| 2 | Express backend foundation (article CRUD, validation, error handling) |
| 3 | MySQL schema |
| 4 | FastAPI AI service foundation (mock workflow) |
| 5 | Connect Express ↔ FastAPI (end-to-end flow) ← **current** |
| 6 | LangGraph workflow orchestration |
| 7–12 | Real agents: Research, Fact Checker, Editor, SEO, Publisher, Evaluator |
| 13 | Dashboard observability |
| 14 | Article history |
| 15 | Markdown export + article viewer |
| 16 | Production polish & deployment docs ← **current** |
| 13 | Dashboard observability |
| 14 | Article history |
| 15 | Markdown export |
| 16 | Production polish & deployment docs |

## Conventions

- **API responses** use a single shape everywhere:
  ```json
  { "success": true, "message": "", "data": {}, "error": null }
  ```
- **Secrets** come from environment variables only. See each service's `.env.example`.
- **Frontend** follows `DESIGN.md` for all visual decisions.

## Current status

Phases 0–12 implemented. The full chain is wired end-to-end:

- **Frontend** shell, routing, layout, and the Create flow (calls the backend).
- **Express backend** — article CRUD plus the AI workflow connection (Phase 5).
- **MySQL schema** (in-memory fallback when `MYSQL_URL` is unset).
- **FastAPI AI service** — LangGraph pipeline with all six agents.
- **Real LLM provider** — Gemini (`gemini-2.5-flash`) wired in; falls back to a
  deterministic mock when no key is present.

**Phase 5 (Connect Express ↔ FastAPI) is complete and verified:** `POST /api/articles`
runs the full agent pipeline via the AI service and persists the enriched result.

**Phase 13 (Dashboard observability) is complete:** the Dashboard renders a run's agent
timeline (per-agent status, latency, tokens, cost), progress, metric cards (sources,
tokens, cost, duration), the five-dimension evaluation score, and any errors. It shows
the run from `?id=` or the most recent article; the Create flow lands here on success.

**Phase 14 (Article history) is complete:** the History page loads saved articles from
`GET /api/articles`, with client-side search, status + evaluation score per row,
relative timestamps, delete (with confirmation), and loading / empty / no-match / error
states. Each row opens the article.

**Phase 15 (Markdown export + article viewer) is complete:** the Article Viewer renders
the published markdown (react-markdown + GFM, on-brand components), SEO metadata,
keyword chips, a references list, and the evaluation breakdown. Export is available as
**Download .md** (`GET /api/articles/:id/export` → `text/markdown` attachment, slug
filename) and **Copy markdown** (clipboard).

**Phase 16 (Production polish & deployment docs) is complete:** Settings now reflects the
live provider/model and AI-service connectivity (`GET /api/config`); documentation covers
[architecture](architecture.md), the [API](api.md), and [deployment](deployment.md)
(Vercel + Render + Railway); the README has a setup guide and screenshots section. The
full generation flow is verified end-to-end against real Gemini.

**MVP complete.**

> Note: the Gemini **free tier allows ~20 requests/day**, i.e. roughly 3 full
> article runs. Heavy testing exhausts it until the daily reset; use a paid key
> or the mock provider (`LLM_PROVIDER=mock`) for unlimited local runs.
