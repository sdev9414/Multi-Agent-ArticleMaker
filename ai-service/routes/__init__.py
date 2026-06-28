from fastapi import APIRouter

from routes.health import router as health_router
from routes.workflow import router as workflow_router

api_router = APIRouter()
api_router.include_router(health_router)
api_router.include_router(workflow_router)

__all__ = ["api_router"]
