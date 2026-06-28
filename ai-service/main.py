"""FastAPI entrypoint for the Multi-Agent Newsroom AI service."""
from __future__ import annotations

import logging

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware

from routes import api_router
from utils.responses import fail

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)-5s %(name)s: %(message)s",
)

app = FastAPI(title="Multi-Agent Newsroom AI Service", version="0.1.0")

# Express is the only intended caller; CORS is permissive for local dev.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.exception_handler(RequestValidationError)
async def validation_handler(_req: Request, exc: RequestValidationError):
    return fail("Validation failed", status_code=422, error=exc.errors())


@app.exception_handler(Exception)
async def unhandled_handler(_req: Request, exc: Exception):
    logging.getLogger("app").exception("Unhandled error")
    return fail("Internal server error", status_code=500, error=str(exc))


@app.get("/")
def root():
    return {"success": True, "message": "Multi-Agent Newsroom AI Service", "data": None, "error": None}
