"""
Workflow runner service.

Owns run lifecycle and status storage so routes stay thin. Runs execute
synchronously (the pipeline is fast and Express awaits the result), but each
run's final state is cached by id so GET /workflow/status/{id} works.
"""
from __future__ import annotations

import logging
import uuid

from graph.workflow import run_workflow
from models.schemas import WorkflowRequest, WorkflowResult
from services.llm import get_llm_settings

logger = logging.getLogger("runner")

# ponytail: in-process cache; swap for Redis/DB if multi-instance status is needed.
_RUNS: dict[str, WorkflowResult] = {}


def start_run(req: WorkflowRequest) -> WorkflowResult:
    """Execute the pipeline for a request and return the full result."""
    run_id = str(uuid.uuid4())
    settings = get_llm_settings()
    logger.info("Run %s starting (provider=%s model=%s)", run_id, settings.provider, settings.model)

    state = run_workflow(req.topic, req.article_type, req.audience)

    status = "failed" if state.get("errors") and not state.get("final_article") else "completed"
    result = WorkflowResult(
        id=run_id,
        topic=req.topic,
        article_type=req.article_type,
        audience=req.audience,
        status=status,
        current_agent=None,
        completed_agents=state.get("completed_agents", []),
        sources=state.get("sources", []),
        research_notes=state.get("research_notes", []),
        verified_claims=state.get("verified_claims", []),
        outline=state.get("outline", ""),
        draft=state.get("draft", ""),
        seo=state.get("seo", {}) or {},
        final_article=state.get("final_article", ""),
        evaluation=state.get("evaluation", {}) or {},
        agent_runs=state.get("agent_runs", []),
        errors=state.get("errors", []),
        total_tokens=state.get("total_tokens", 0),
        total_cost_usd=state.get("total_cost_usd", 0.0),
        duration_ms=state.get("duration_ms", 0),
        model=settings.model,
        provider=settings.provider,
    )
    _RUNS[run_id] = result
    logger.info("Run %s %s in %dms (%d tokens)", run_id, status, result.duration_ms, result.total_tokens)
    return result


def get_run(run_id: str) -> WorkflowResult | None:
    return _RUNS.get(run_id)
