"""
LLMClient — the single entry point agents use to call a model.

Wraps the active provider (chosen in config.py) with retry logic and usage
tracking. Agents never import a provider directly; they call `get_client()`.
"""
from __future__ import annotations

import logging
import time

from .config import get_llm_settings
from .providers import LLMProvider, LLMResult, get_provider

logger = logging.getLogger("llm")


# Substrings that mark a provider rate-limit / quota error (HTTP 429).
_RATE_LIMIT_MARKERS = ("429", "resourceexhausted", "rate limit", "quota", "too many requests")
# Free tiers can ask for long cool-offs; wait, but never longer than this.
_RATE_LIMIT_BACKOFF_CAP = 30.0


class LLMClient:
    def __init__(self, provider: LLMProvider, *, max_retries: int = 4):
        self.provider = provider
        self.max_retries = max_retries

    @property
    def model(self) -> str:
        return self.provider.settings.model

    @property
    def provider_name(self) -> str:
        return self.provider.settings.provider

    def complete(self, prompt: str, system: str | None = None) -> LLMResult:
        return self._with_retry(lambda: self.provider.complete(prompt, system))

    def complete_json(self, prompt: str, system: str | None = None):
        """Return (parsed_dict, LLMResult). Retries cover transient + JSON errors."""
        return self._with_retry(lambda: self.provider.complete_json(prompt, system))

    def _with_retry(self, fn):
        last_exc = None
        for attempt in range(self.max_retries + 1):
            try:
                return fn()
            except Exception as exc:  # noqa: BLE001 — provider/network/JSON errors
                last_exc = exc
                if attempt >= self.max_retries:
                    break
                wait = self._backoff_seconds(exc, attempt)
                logger.warning("LLM attempt %d failed: %s (retrying in %.1fs)", attempt + 1, exc, wait)
                time.sleep(wait)
        raise RuntimeError(f"LLM call failed after {self.max_retries + 1} attempts: {last_exc}")

    @staticmethod
    def _backoff_seconds(exc: Exception, attempt: int) -> float:
        """
        Rate-limit (429) errors need a long cool-off; the provider may ask for
        tens of seconds. Other transient errors use a short exponential backoff.
        """
        if _is_rate_limit(exc):
            return min(_RATE_LIMIT_BACKOFF_CAP, 10.0 * (attempt + 1))
        return 0.5 * (2 ** attempt)


def get_client(*, max_retries: int = 4) -> LLMClient:
    """Build a client for the currently-active provider."""
    settings = get_llm_settings()
    return LLMClient(get_provider(settings), max_retries=max_retries)


def _is_rate_limit(exc: Exception) -> bool:
    """True when an exception looks like a provider rate-limit / quota error."""
    text = f"{type(exc).__name__} {exc}".lower()
    return any(marker in text for marker in _RATE_LIMIT_MARKERS)
