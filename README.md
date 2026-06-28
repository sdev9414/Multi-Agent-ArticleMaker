# Multi-Agent Newsroom

An AI **workflow engine** that produces fact-checked, citation-backed, SEO-optimized articles by orchestrating multiple specialized AI agents — not a chatbot.

A user provides a topic; a pipeline of single-responsibility agents researches, fact-checks, edits, optimizes, publishes, and evaluates the article.

## How it works

```
Frontend (React)
   ↓
Express Backend        auth · article CRUD · API gateway · export
   ↓
FastAPI AI Service     LangGraph workflow · agents · search · evaluation
   ↓
LangGraph Workflow
   ↓
Research → Fact Checker → Editor → SEO → Publisher → Evaluator
   ↓
MySQL
```

### Agents (one responsibility each)

| Agent | Does | Never |
|-------|------|-------|
| **Research** | search, collect sources, dedupe, summarize | write the article |
| **Fact Checker** | verify claims, attach citations, flag weak evidence | invent citations |
| **Editor** | outline, structure, readability | research |
| **SEO** | title, meta, slug, keywords, headings | — |
| **Publisher** | final markdown, references, formatting | — |
| **Evaluator** | score factuality/citations/readability/completeness/SEO | return prose (JSON only) |

## Tech stack

- **Frontend** — React, Tailwind CSS, React Router, Axios, Recharts, react-markdown
- **Backend** — Express.js (auth, CRUD, gateway, export)
- **AI Service** — Python FastAPI + LangGraph
- **Models** — OpenAI GPT-5.5 / Gemini 2.5 Pro, Tavily Search, Langfuse (optional)
- **Database** — MySQL

## Repository layout

```
frontend/      React app
backend/       Express API gateway
ai-service/    FastAPI + LangGraph agents
database/      MySQL schema & seeds
docs/          architecture, API & deployment docs
```

## Documentation

- [Project overview & build plan](docs/overview.md)
- [Architecture](docs/architecture.md) — services, request flow, agents, observability
- [API reference](docs/api.md) — every endpoint, request/response shapes
- [Deployment](docs/deployment.md) — Vercel + Render + Railway, step by step

## Screenshots

> Capture these from the running app (`npm run dev`) and drop them in `docs/images/`.

| Surface | Screenshot |
|---------|-----------|
| Landing | `docs/images/landing.png` |
| Create Article | `docs/images/create.png` |
| Dashboard (agent timeline + metrics) | `docs/images/dashboard.png` |
| Article Viewer (markdown + references + score) | `docs/images/article.png` |
| History | `docs/images/history.png` |

## Getting started

Run all three services locally (each in its own terminal):

```bash
# 1. AI service (FastAPI) — port 8010
cd ai-service
python -m venv .venv && .venv/Scripts/activate   # macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # set LLM_PROVIDER + GEMINI_API_KEY (or leave for mock)
python -m uvicorn main:app --port 8010

# 2. Backend (Express) — port 4000
cd backend
cp .env.example .env          # FASTAPI_URL defaults to http://localhost:8010
npm install && npm start

# 3. Frontend (Vite) — port 5173
cd frontend
npm install && npm run dev
```

Then open http://localhost:5173. Secrets are loaded from environment variables only and
are never committed (`.env` is gitignored). With no API key, the AI service uses a
deterministic **mock** provider so the full flow still runs offline.

> The Gemini **free tier allows ~20 requests/day** (about 3 full runs). Once exhausted,
> runs fail with a rate-limit error until the daily reset — switch to a paid key or set
> `LLM_PROVIDER=mock` for unlimited local runs.

## Status

**MVP complete (Phases 0–16).** End-to-end: `POST /api/articles` runs the full agent
pipeline through the FastAPI AI service and persists the enriched result; the Dashboard
renders the run's timeline, progress, metrics, and evaluation; History lists saved runs
with search, score, and delete; the Article Viewer renders the published markdown with
references and an evaluation breakdown, and exports as a `.md` download or clipboard copy;
Settings reflects the live provider/model and AI-service connectivity.

The AI service uses **Gemini `gemini-2.5-flash`** by default and falls back to a
deterministic **mock** provider when no API key is set, so the app always runs locally.
