"""Workflow routes: POST /workflow/run, GET /workflow/status/{id}."""
from __future__ import annotations

from fastapi import APIRouter

from models.schemas import WorkflowRequest
from services import runner
from utils.responses import ok, fail

router = APIRouter(prefix="/workflow", tags=["workflow"])


@router.post("/run")
def run(req: WorkflowRequest):
    """Execute the agent pipeline and return the full result."""
    try:
        result = runner.start_run(req)
    except Exception as exc:  # noqa: BLE001
        return fail("Workflow execution failed", status_code=500, error=str(exc))

    status = 200 if result.status == "completed" else 502
    return ok(data=result.model_dump(), message=f"Workflow {result.status}", status_code=status)


@router.get("/status/{run_id}")
def status(run_id: str):
    result = runner.get_run(run_id)
    if result is None:
        return fail(f"Run {run_id} not found", status_code=404)
    return ok(data=result.model_dump(), message="Run found")
