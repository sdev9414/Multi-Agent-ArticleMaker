"""
═══════════════════════════════════════════════════════════════════════════
  THE ONE FILE TO EDIT TO CHANGE MODELS OR API KEYS.
═══════════════════════════════════════════════════════════════════════════

To switch the model or provider, change `ACTIVE` below (or set the matching
environment variables in `ai-service/.env`). Nothing else in the codebase needs
to change — every agent reads the provider through this module.

Keys live in environment variables, never in code. See `.env.example`.

Add a new provider:
  1. Implement an LLMProvider subclass in providers.py.
  2. Register it in PROVIDERS in providers.py.
  3. Point ACTIVE.provider at its name here.
"""
from __future__ import annotations

import os
from dataclasses import dataclass, replace

from dotenv import load_dotenv

load_dotenv()


@dataclass(frozen=True)
class LLMSettings:
    """Resolved provider + model + key. One instance describes 'who answers'."""

    provider: str          # "openai" | "openrouter" | "gemini" | "mock"
    model: str             # provider-specific model id
    api_key: str           # read from env; empty string ⇒ fall back to mock
    temperature: float = 0.4
    max_tokens: int = 2048
    base_url: str = ""     # OpenAI-compatible override (OpenRouter); "" ⇒ default

    @property
    def has_key(self) -> bool:
        return bool(self.api_key.strip())


# ── Per-provider model + key wiring ────────────────────────────────────────
# Defaults are sensible; override any value via the named environment variable.

def _openai() -> LLMSettings:
    return LLMSettings(
        provider="openai",
        model=os.getenv("OPENAI_MODEL", "gpt-5.5"),
        api_key=os.getenv("OPENAI_API_KEY", ""),
    )


def _gemini() -> LLMSettings:
    return LLMSettings(
        provider="gemini",
        model=os.getenv("GEMINI_MODEL", "gemini-2.5-pro"),
        api_key=os.getenv("GEMINI_API_KEY", ""),
    )


def _openrouter() -> LLMSettings:
    # OpenRouter is OpenAI-API-compatible: same SDK, different base_url. Models
    # are namespaced, e.g. "openai/gpt-4o-mini", "google/gemini-2.5-flash".
    return LLMSettings(
        provider="openrouter",
        model=os.getenv("OPENROUTER_MODEL", "openai/gpt-4o-mini"),
        api_key=os.getenv("OPENROUTER_API_KEY", ""),
        base_url="https://openrouter.ai/api/v1",
    )


def _mock() -> LLMSettings:
    # No key needed; produces deterministic offline output.
    return LLMSettings(provider="mock", model="mock-1", api_key="local")


_BUILDERS = {"openai": _openai, "openrouter": _openrouter, "gemini": _gemini, "mock": _mock}


# ── Per-agent model tiers (OpenRouter only) ─────────────────────────────────
# Agents that reason/judge get the strong model; mechanical agents get the
# cheap one. Tiers apply ONLY to OpenRouter, which routes any slug per-request.
# Other providers have one configured model and ignore the tier.
def _openrouter_tier_model(tier: str) -> str:
    if tier == "strong":
        return os.getenv("OPENROUTER_MODEL_STRONG", "openai/gpt-4o")
    if tier == "small":
        return os.getenv("OPENROUTER_MODEL_SMALL", "openai/gpt-4o-mini")
    return os.getenv("OPENROUTER_MODEL", "openai/gpt-4o-mini")


# ── CHANGE THIS LINE to pick a provider ─────────────────────────────────────
# Or set LLM_PROVIDER in the environment. Order of precedence:
#   1. LLM_PROVIDER env var
#   2. the literal default below
_SELECTED = os.getenv("LLM_PROVIDER", "openai")


def get_llm_settings(tier: str | None = None) -> LLMSettings:
    """
    Return the active LLM settings, optionally for a per-agent model `tier`
    ("strong" | "small"). Tier only changes the model on OpenRouter; every
    other provider uses its single configured model.

    Falls back to the mock provider automatically when the selected provider
    has no API key, so the app always runs locally without credentials.
    """
    builder = _BUILDERS.get(_SELECTED, _openai)
    settings = builder()
    if settings.provider != "mock" and not settings.has_key:
        return _mock()
    if tier and settings.provider == "openrouter":
        return replace(settings, model=_openrouter_tier_model(tier))
    return settings
