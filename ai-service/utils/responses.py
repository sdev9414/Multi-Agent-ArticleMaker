"""Standard API envelope for FastAPI responses: {success, message, data, error}."""
from __future__ import annotations

from typing import Any

from fastapi.responses import JSONResponse


def envelope(data: Any = None, message: str = "OK", success: bool = True, error: Any = None) -> dict:
    return {"success": success, "message": message, "data": data, "error": error}


def ok(data: Any = None, message: str = "OK", status_code: int = 200) -> JSONResponse:
    return JSONResponse(status_code=status_code, content=envelope(data=data, message=message))


def fail(message: str, status_code: int = 500, error: Any = None) -> JSONResponse:
    return JSONResponse(
        status_code=status_code,
        content=envelope(success=False, message=message, error=error),
    )
