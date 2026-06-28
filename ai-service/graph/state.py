"""Shared LangGraph workflow state. Each agent updates ONLY its own fields."""
from __future__ import annotations

from typing import TypedDict


class WorkflowState(TypedDict, total=False):
    # Inputs
    topic: str
    article_type: str
    audience: str
    # Research agent
    sources: list
    research_notes: list
    extracted_facts: list
    # Fact Checker agent
    verified_claims: list
    rejected_claims: list
    weak_evidence: list
    # Editor agent
    outline: str
    draft: str
    # SEO agent
    seo: dict
    # Publisher agent
    final_article: str
    # Evaluator agent
    evaluation: dict
    # Observability (appended to, never overwritten wholesale)
    agent_runs: list
    errors: list
    current_agent: str
    completed_agents: list
