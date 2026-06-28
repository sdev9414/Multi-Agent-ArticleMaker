# Architecture

Multi-Agent Newsroom is an AI **workflow engine**: a topic enters, a deterministic
pipeline of single-responsibility agents researches, fact-checks, edits, optimizes,
publishes, and evaluates it, and a fully-formed article comes out. It is intentionally
*not* a chatbot.

## System overview

```
┌─────────────┐    HTTP /api    ┌──────────────┐   HTTP /workflow   ┌────────────────┐
│  React SPA  │ ───────────────▶│   Express    │ ──────────────────▶│  FastAPI AI    │
│  (Vite)     │◀─────────────── │   gateway    │◀────────────────── │  service       │
└─────────────┘   JSON envelope └──────┬───────┘   JSON envelope     └───────┬────────┘
                                       │                                     │
                                       ▼                                     ▼
                                 ┌──────────┐                        ┌───────────────┐
                                 │  MySQL   │                        │   LangGraph   │
                                 │ (or in-  │                        │   pipeline    │
                                 │  memory) │                        └───────┬───────┘
                                 └──────────┘                                │
                            Research → Fact Checker → Editor → SEO → Publisher → Evaluator
```

Three independently deployable services, each with one job:

| Service | Responsibility | Stack |
|---------|----------------|-------|
| **Frontend** | UI: create, dashboard, history, viewer, settings | React, Vite, Tailwind, React Router, Axios, react-markdown |
| **Backend** | API gateway, article CRUD, persistence, export, AI orchestration | Express, mysql2 |
| **AI service** | Agent pipeline, search, evaluation, prompts | FastAPI, LangGraph, google-generativeai |

## Request flow: generating an article

1. **Frontend** `POST /api/articles` with `{ topic, articleType, audience }`.
2. **Backend** validates input, persists a `pending` article row, then calls the AI service
   `POST /workflow/run`.
3. **AI service** runs the LangGraph pipeline synchronously and returns the full result
   (article, sources, per-agent runs, evaluation, metrics).
4. **Backend** normalizes the result into a single camelCase shape, persists it (article +
   sources + agent runs + evaluation), and returns the enriched article.
5. **Frontend** navigates to the Dashboard for that run; History and the Article Viewer read
   it back via `GET /api/articles/:id`.

The run is synchronous because the pipeline is fast and the gateway awaits it. Status is also
cached per run id in the AI service (`GET /workflow/status/{id}`) for future async/streaming use.

## The agent pipeline

Each agent has exactly one responsibility and communicates only through shared workflow
state. Agents never mutate fields they don't own. A `BaseAgent` wraps every agent with
timing, token/cost accounting, retry, and failure capture, so a single agent failing is
recorded (in `errors` / its `agent_run`) without crashing the run.

| Agent | Input | Output | Never |
|-------|-------|--------|-------|
| **Research** | topic, type, audience | sources, research notes, extracted facts | writes the article |
| **Fact Checker** | research output | verified claims, weak evidence | invents citations |
| **Editor** | verified claims | outline, draft | researches |
| **SEO** | draft | title, meta description, slug, keywords, headings | — |
| **Publisher** | draft + SEO | final markdown, references | — |
| **Evaluator** | final article | scores (factuality, citations, readability, completeness, SEO) | returns prose |

## Shared workflow state

```python
{
  "topic": "", "article_type": "", "audience": "",
  "sources": [], "research_notes": [], "extracted_facts": [],
  "verified_claims": [], "rejected_claims": [], "weak_evidence": [],
  "outline": "", "draft": "", "seo": {}, "final_article": "",
  "evaluation": {}, "agent_runs": [], "errors": [],
  "completed_agents": [], "current_agent": None,
}
```

## Swappable LLM provider

The provider is chosen in one place (`ai-service/services/llm/config.py`) via the
`LLM_PROVIDER` env var (`openai` | `gemini` | `mock`). Every agent talks to an abstract
`LLMProvider` through `get_client()`, so swapping providers changes nothing else. When the
selected provider has no API key, the service falls back to a deterministic **mock**
provider so the whole app runs offline. The LLM client adds retry with rate-limit-aware
backoff (429s wait longer, capped).

## Observability

Every agent run records latency, input/output tokens, estimated cost (per-model price
table in `utils/cost.py`), retries, and any error. These roll up into per-run totals
(`total_tokens`, `total_cost_usd`, `duration_ms`) surfaced on the Dashboard.

## API envelope

Every JSON endpoint (both services) returns the same shape:

```json
{ "success": true, "message": "", "data": {}, "error": null }
```

The one exception is `GET /api/articles/:id/export`, which returns a `text/markdown`
file download.

## Persistence

The backend uses MySQL when `MYSQL_URL` is set (schema in `database/schema.sql`:
`users`, `articles`, `sources`, `agent_runs`, `evaluations`, `article_versions`).
Without it, an in-memory store keeps the API fully functional for local development —
both paths return the same normalized shapes.
