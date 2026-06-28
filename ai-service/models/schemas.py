"""Pydantic request/response models for the AI service."""
from __future__ import annotations

from pydantic import BaseModel, Field


# ── Requests ────────────────────────────────────────────────────────────────
class WorkflowRequest(BaseModel):
    topic: str = Field(min_length=3, max_length=300)
    article_type: str = "Explainer"
    audience: str = "General public"


# ── Workflow sub-structures ──────────────────────────────────────────────────
class Source(BaseModel):
    title: str | None = None
    url: str
    snippet: str | None = None
    publisher: str | None = None
    published_date: str | None = None
    credibility_notes: str | None = None


class AgentRun(BaseModel):
    agent: str
    status: str                 # pending | running | completed | failed
    latency_ms: int = 0
    tokens_input: int = 0
    tokens_output: int = 0
    cost_usd: float = 0.0
    retries: int = 0
    error: str | None = None


class Evaluation(BaseModel):
    factuality: int = 0
    citation_quality: int = 0
    readability: int = 0
    completeness: int = 0
    seo_quality: int = 0
    overall_score: int = 0
    issues: list[str] = Field(default_factory=list)


class Seo(BaseModel):
    title: str = ""
    meta_description: str = ""
    slug: str = ""
    keywords: list[str] = Field(default_factory=list)
    headings: list[str] = Field(default_factory=list)


# ── Responses ─────────────────────────────────────────────────────────────
class WorkflowResult(BaseModel):
    """Full output of a completed (or failed) run."""

    id: str
    topic: str
    article_type: str
    audience: str
    status: str
    current_agent: str | None = None
    completed_agents: list[str] = Field(default_factory=list)
    sources: list[Source] = Field(default_factory=list)
    research_notes: list[str] = Field(default_factory=list)
    verified_claims: list[dict] = Field(default_factory=list)
    outline: str = ""
    draft: str = ""
    seo: Seo = Field(default_factory=Seo)
    final_article: str = ""
    evaluation: Evaluation = Field(default_factory=Evaluation)
    agent_runs: list[AgentRun] = Field(default_factory=list)
    errors: list[str] = Field(default_factory=list)
    total_tokens: int = 0
    total_cost_usd: float = 0.0
    duration_ms: int = 0
    model: str = ""
    provider: str = ""
