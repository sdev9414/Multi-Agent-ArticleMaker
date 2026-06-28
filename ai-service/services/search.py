"""
Tavily search integration, isolated behind one function.

Falls back to deterministic mock results when TAVILY_API_KEY is absent, so the
Research agent runs offline. Real call lives only in `_tavily_search`.
"""
from __future__ import annotations

import logging
import os

from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger("search")


def search(query: str, max_results: int = 6) -> list[dict]:
    """Return a list of {title, url, content, published_date} search results."""
    key = os.getenv("TAVILY_API_KEY", "").strip()
    if not key:
        logger.info("TAVILY_API_KEY not set — using mock search results.")
        return _mock_search(query, max_results)
    try:
        return _tavily_search(query, key, max_results)
    except Exception as exc:  # noqa: BLE001
        logger.warning("Tavily search failed (%s) — falling back to mock.", exc)
        return _mock_search(query, max_results)


def _tavily_search(query: str, key: str, max_results: int) -> list[dict]:
    # TODO(api): real Tavily call. Active once TAVILY_API_KEY is set.
    from tavily import TavilyClient

    client = TavilyClient(api_key=key)
    resp = client.search(query=query, max_results=max_results, include_raw_content=False)
    return [
        {
            "title": r.get("title", ""),
            "url": r.get("url", ""),
            "content": r.get("content", ""),
            "published_date": r.get("published_date", ""),
        }
        for r in resp.get("results", [])
    ]


def _mock_search(query: str, max_results: int) -> list[dict]:
    base = [
        {
            "title": f"Overview of {query}",
            "url": "https://example.com/overview",
            "content": f"A broad introduction to {query} and why it matters in 2026.",
            "published_date": "2026-01-15",
        },
        {
            "title": f"{query}: recent developments",
            "url": "https://example.org/recent",
            "content": f"Recent data and milestones related to {query}.",
            "published_date": "2026-03-02",
        },
        {
            "title": f"Understanding {query}",
            "url": "https://example.net/understanding",
            "content": f"A practical explainer covering the fundamentals of {query}.",
            "published_date": "2025-11-20",
        },
    ]
    return base[:max_results]
