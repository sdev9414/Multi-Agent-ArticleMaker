# Multi-Agent Newsroom

## Project Overview

You are working on **Multi-Agent Newsroom**, a production-oriented AI Engineering project designed to demonstrate modern LLM application development.

The application generates high-quality articles by orchestrating multiple specialized AI agents rather than relying on a single prompt.

The project should be implemented with production-quality engineering practices suitable for a portfolio targeting Software Engineer, AI Engineer, and AI Software Engineer roles.

---

# Frontend Design

All frontend design decisions (layout, components, color system, typography, spacing, visual language) must follow **DESIGN.md** in this directory.

For any UI/frontend work use the impeccable skill.

Consult `DESIGN.md` before building or modifying any UI. If `DESIGN.md` is not yet present, ask before inventing a design language.

---

# Primary Goal

Build a system where multiple AI agents collaborate to produce a fact-checked, citation-backed, SEO-optimized article from a user-provided topic.

The application must emphasize:

* modular architecture
* maintainable code
* observable agent execution
* explainability
* scalability
* production readiness

This is **NOT** a chatbot.

It is an AI workflow engine.

---

# Tech Stack

## Frontend

* React
* Tailwind CSS
* React Router
* Axios
* Recharts
* react-markdown

---

## Backend

### Node Backend

Express.js

Responsibilities:

* Authentication
* Article CRUD
* User management
* Database operations
* API Gateway
* Export APIs

---

### AI Backend

Python FastAPI

Responsibilities:

* LangGraph workflow
* AI agents
* Search
* Prompt management
* Evaluation
* Streaming outputs

---

## AI

* LangGraph
* OpenAI GPT-5.5 / Gemini 2.5 Pro
* Tavily Search API
* Langfuse (optional)

---

## Database

MySQL

---

# Architecture

Frontend

↓

Express Backend

↓

FastAPI AI Service

↓

LangGraph Workflow

↓

Research

↓

Fact Checker

↓

Editor

↓

SEO

↓

Publisher

↓

Evaluator

↓

Database

---

# Core Principle

Each agent should have exactly ONE responsibility.

Avoid giant prompts.

Agents communicate only through shared workflow state.

---

# Agent Responsibilities

## Research Agent

Input

* topic
* article type
* audience

Output

* research notes
* source list
* extracted facts

Responsibilities

* perform search
* collect sources
* remove duplicates
* summarize findings

Never generate the article.

---

## Fact Checker Agent

Input

Research output

Responsibilities

* verify every factual claim
* reject unsupported information
* attach citations
* identify weak evidence

Never invent citations.

---

## Editor Agent

Responsibilities

* create article outline
* improve readability
* organize sections
* rewrite awkward paragraphs

Never perform research.

---

## SEO Agent

Responsibilities

Generate

* SEO title
* meta description
* slug
* keywords
* heading hierarchy

---

## Publisher Agent

Responsibilities

Generate

* final markdown
* references
* source section
* final formatting

---

## Evaluator Agent

Responsibilities

Evaluate

* factuality
* citation quality
* readability
* completeness
* SEO quality

Return structured JSON only.

---

# Shared Workflow State

Each agent updates the shared state.

Example

```python
{
    "topic": "",
    "sources": [],
    "research_notes": [],
    "verified_claims": [],
    "outline": "",
    "draft": "",
    "seo": {},
    "final_article": "",
    "evaluation": {}
}
```

Agents should NEVER mutate unrelated fields.

---

# Project Folder Structure

```
frontend/

backend/

ai-service/

docs/

database/
```

Inside ai-service

```
agents/

graph/

prompts/

services/

utils/

models/
```

---

# Coding Standards

## General

* Small functions
* No duplicated logic
* SOLID principles
* Clear variable names
* Type hints in Python
* Async wherever appropriate

---

## React

Use

* Functional Components
* Hooks
* Custom Hooks
* Feature-based folders

Avoid

* Massive components
* Business logic inside JSX

---

## Express

Structure

controllers

↓

services

↓

repositories

↓

database

Never put business logic inside routes.

---

## FastAPI

Separate

routes

services

agents

workflow

models

utils

---

# Error Handling

Every API must return

```
success

message

data

error
```

Example

```json
{
    "success": true,
    "message": "Article created",
    "data": {},
    "error": null
}
```

---

# Logging

Log

* agent execution
* latency
* failures
* retries
* token usage

Never silently swallow exceptions.

---

# Database Design

Tables

Users

Articles

Sources

AgentRuns

Evaluations

ArticleVersions

---

# Prompt Engineering Rules

Each prompt should

* define role
* define objective
* define output format
* avoid chain-of-thought requests
* request structured JSON where applicable

Prompts belong inside

```
prompts/
```

Never inline large prompts inside code.

---

# UI Pages

Landing Page

Create Article

Dashboard

Article Viewer

History

Settings

---

# Dashboard Requirements

Display

Current Agent

Completed Agents

Progress Bar

Execution Time

Source Count

Token Usage

Cost Estimate

Errors

Evaluation Score

---

# API Design

Express

```
POST /articles

GET /articles

GET /articles/:id

DELETE /articles/:id
```

FastAPI

```
POST /workflow/run

GET /workflow/status/{id}
```

---

# Security

Validate every request.

Sanitize user input.

Never expose API keys.

Use environment variables.

---

# Environment Variables

Node

```
MYSQL_URL

JWT_SECRET

FASTAPI_URL
```

Python

```
OPENAI_API_KEY

TAVILY_API_KEY

LANGFUSE_SECRET_KEY

MYSQL_URL
```

---

# Deployment Targets

Frontend

Vercel

Backend

Render

FastAPI

Render

Database

Railway MySQL

---

# Documentation

Every major feature requires

* README update
* Architecture explanation
* API documentation
* Screenshots

---

# Git Strategy

Feature branches

```
feature/research-agent

feature/editor-agent

feature/dashboard
```

Never push directly to main.

---

# Code Quality

Before every commit

* lint
* format
* remove dead code
* update README if feature changes

---

# Definition of Done

A feature is complete only if

* it works
* errors are handled
* UI is polished
* loading state exists
* empty state exists
* backend tested
* documentation updated

---

# MVP Features

The first deployable version must include

* Topic input
* Research Agent
* Fact Checker Agent
* Editor Agent
* SEO Agent
* Publisher Agent
* Evaluator Agent
* Source citations
* Dashboard
* Markdown export
* Saved article history

---

# Future Features

After MVP

* Authentication
* Teams
* Human approval workflow
* WordPress publishing
* Notion publishing
* Version comparison
* Langfuse tracing
* Cost analytics
* A/B testing prompts
* Multi-language generation

---

# Development Philosophy

Prioritize

1. Correctness
2. Maintainability
3. Observability
4. User Experience
5. Performance

Never sacrifice architecture for short-term speed.

Every piece of code should be production-ready and interview-worthy.
