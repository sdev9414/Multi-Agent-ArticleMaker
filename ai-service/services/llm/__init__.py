"""Swappable LLM layer. Import `get_client` to talk to the active provider."""
from .client import LLMClient, get_client
from .config import get_llm_settings, LLMSettings
from .providers import LLMResult

__all__ = ["LLMClient", "get_client", "get_llm_settings", "LLMSettings", "LLMResult"]
