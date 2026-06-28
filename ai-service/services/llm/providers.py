"""
LLM provider implementations.

Each provider isolates a single integration. The rest of the app talks to the
abstract `LLMProvider` interface, so swapping providers (config.py) changes
nothing else. The real API calls live ONLY in the `_call` methods here.
"""
from __future__ import annotations

import json
import logging
from abc import ABC, abstractmethod
from dataclasses import dataclass, field

from .config import LLMSettings

logger = logging.getLogger("llm")


@dataclass
class LLMResult:
    """A completion plus the usage needed for cost/observability."""

    text: str
    tokens_input: int = 0
    tokens_output: int = 0
    raw: dict = field(default_factory=dict)


class LLMProvider(ABC):
    """Common interface every provider implements."""

    def __init__(self, settings: LLMSettings):
        self.settings = settings

    @abstractmethod
    def complete(self, prompt: str, system: str | None = None) -> LLMResult:
        """Return a completion for `prompt` with optional `system` instruction."""

    def complete_json(self, prompt: str, system: str | None = None) -> tuple[dict, LLMResult]:
        """Complete and parse the result as JSON. Raises ValueError on bad JSON."""
        result = self.complete(prompt, system)
        return _parse_json(result.text), result


# ── OpenAI ──────────────────────────────────────────────────────────────────
class OpenAIProvider(LLMProvider):
    def complete(self, prompt: str, system: str | None = None) -> LLMResult:
        # TODO(api): real OpenAI call. Active once OPENAI_API_KEY is set.
        from openai import OpenAI

        client = OpenAI(api_key=self.settings.api_key)
        messages = []
        if system:
            messages.append({"role": "system", "content": system})
        messages.append({"role": "user", "content": prompt})

        resp = client.chat.completions.create(
            model=self.settings.model,
            messages=messages,
            temperature=self.settings.temperature,
            max_tokens=self.settings.max_tokens,
        )
        usage = resp.usage
        return LLMResult(
            text=resp.choices[0].message.content or "",
            tokens_input=getattr(usage, "prompt_tokens", 0),
            tokens_output=getattr(usage, "completion_tokens", 0),
        )


# ── Gemini ──────────────────────────────────────────────────────────────────
class GeminiProvider(LLMProvider):
    def complete(self, prompt: str, system: str | None = None) -> LLMResult:
        # TODO(api): real Gemini call. Active once GEMINI_API_KEY is set.
        import google.generativeai as genai

        genai.configure(api_key=self.settings.api_key)
        model = genai.GenerativeModel(
            self.settings.model,
            system_instruction=system or None,
        )
        resp = model.generate_content(
            prompt,
            generation_config={
                "temperature": self.settings.temperature,
                "max_output_tokens": self.settings.max_tokens,
            },
        )
        usage = getattr(resp, "usage_metadata", None)
        return LLMResult(
            text=resp.text or "",
            tokens_input=getattr(usage, "prompt_token_count", 0) if usage else 0,
            tokens_output=getattr(usage, "candidates_token_count", 0) if usage else 0,
        )


# ── Mock (offline) ────────────────────────────────────────────────────────
class MockProvider(LLMProvider):
    """
    Deterministic offline provider. Lets the entire pipeline run without keys.
    Returns the JSON the calling agent expects, keyed by a hint in the system
    prompt (agents pass their name). Falls back to echoing prose.
    """

    def complete(self, prompt: str, system: str | None = None) -> LLMResult:
        from .mock_responses import mock_for

        text = mock_for(system or "", prompt)
        # Rough token estimate so cost/observability has realistic numbers.
        return LLMResult(
            text=text,
            tokens_input=len(prompt) // 4,
            tokens_output=len(text) // 4,
        )


PROVIDERS: dict[str, type[LLMProvider]] = {
    "openai": OpenAIProvider,
    "gemini": GeminiProvider,
    "mock": MockProvider,
}


def get_provider(settings: LLMSettings) -> LLMProvider:
    cls = PROVIDERS.get(settings.provider, MockProvider)
    return cls(settings)


def _parse_json(text: str) -> dict:
    """Extract a JSON object from model output, tolerating ```json fences."""
    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.split("```", 2)[1]
        if cleaned.startswith("json"):
            cleaned = cleaned[4:]
    cleaned = cleaned.strip()
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError as exc:
        raise ValueError(f"Model did not return valid JSON: {exc}") from exc
