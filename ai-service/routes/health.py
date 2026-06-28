"""Health route."""
from fastapi import APIRouter

from services.llm import get_llm_settings
from utils.responses import ok

router = APIRouter(tags=["health"])


@router.get("/health")
def health():
    s = get_llm_settings()
    return ok(
        data={"status": "up", "provider": s.provider, "model": s.model},
        message="Healthy",
    )
