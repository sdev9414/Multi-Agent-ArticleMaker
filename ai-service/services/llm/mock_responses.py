"""
Deterministic offline outputs for the mock provider.

Matches the calling agent by a keyword in its system prompt and returns the
exact JSON / markdown shape that agent expects. This is what lets the full
pipeline run end-to-end with no API keys.
"""
from __future__ import annotations

import json
import re


def _topic_from(prompt: str) -> str:
    """Best-effort extract the topic from an agent prompt for realistic output."""
    m = re.search(r"topic[\"']?\s*[:=]\s*[\"']?([^\"'\n]+)", prompt, re.IGNORECASE)
    if m:
        return m.group(1).strip()
    # Fall back to the first non-empty line.
    for line in prompt.splitlines():
        if line.strip():
            return line.strip()[:80]
    return "the subject"


def mock_for(system: str, prompt: str) -> str:
    # Match on each prompt's unique ROLE line, not loose keywords — keyword
    # sniffing collides (e.g. the fact-checker prompt mentions "research").
    s = system.lower()
    topic = _topic_from(prompt)

    if "research agent" in s:
        return json.dumps({
            "sources": [
                {
                    "title": f"Overview of {topic}",
                    "url": "https://example.com/overview",
                    "snippet": f"A broad introduction to {topic} and why it matters.",
                    "publisher": "Example Journal",
                    "published_date": "2026-01-15",
                    "credibility_notes": "Established publication; primary explainer.",
                },
                {
                    "title": f"{topic}: recent developments",
                    "url": "https://example.org/recent",
                    "snippet": f"Recent data and milestones related to {topic}.",
                    "publisher": "Research Daily",
                    "published_date": "2026-03-02",
                    "credibility_notes": "Reports cite peer-reviewed studies.",
                },
            ],
            "research_notes": [
                f"{topic} has seen significant recent progress.",
                f"Multiple independent sources agree on the core facts about {topic}.",
            ],
            "extracted_facts": [
                f"{topic} is an active area of development in 2026.",
                f"Key benefits of {topic} are documented across sources.",
            ],
        })

    if "fact-checking agent" in s:
        return json.dumps({
            "verified_claims": [
                {
                    "claim": f"{topic} is an active area of development in 2026.",
                    "source_url": "https://example.com/overview",
                    "confidence": "high",
                },
                {
                    "claim": f"Key benefits of {topic} are documented across sources.",
                    "source_url": "https://example.org/recent",
                    "confidence": "medium",
                },
            ],
            "rejected_claims": [],
            "weak_evidence": [
                {
                    "claim": f"{topic} will dominate the market within a year.",
                    "reason": "Speculative; not supported by the gathered sources.",
                }
            ],
        })

    if "editor agent" in s:
        return json.dumps({
            "outline": (
                f"1. Introduction to {topic}\n"
                f"2. How {topic} works\n"
                f"3. Why {topic} matters\n"
                f"4. Challenges and outlook\n"
                f"5. Conclusion"
            ),
            "draft": (
                f"## Introduction\n\n{topic} has become an active area of development. "
                f"This article explains what it is and why it matters [1].\n\n"
                f"## How it works\n\nAt its core, {topic} relies on well-documented principles "
                f"agreed upon across independent sources [2].\n\n"
                f"## Why it matters\n\nThe benefits of {topic} are increasingly clear [1][2].\n\n"
                f"## Challenges and outlook\n\nChallenges remain, and claims of near-term "
                f"dominance are not yet supported by evidence.\n\n"
                f"## Conclusion\n\n{topic} is worth watching closely."
            ),
        })

    if "seo agent" in s:
        slug = re.sub(r"[^a-z0-9]+", "-", topic.lower()).strip("-")[:60] or "article"
        return json.dumps({
            "title": f"{topic.title()}: A Clear, Fact-Checked Explainer",
            "meta_description": f"What {topic} is, how it works, and why it matters — backed by cited sources.",
            "slug": slug,
            "keywords": [topic.lower(), f"{topic.lower()} explained", f"{topic.lower()} 2026"],
            "headings": ["Introduction", "How it works", "Why it matters", "Challenges and outlook", "Conclusion"],
        })

    if "publisher agent" in s:
        return (
            f"# {topic.title()}: A Clear, Fact-Checked Explainer\n\n"
            f"{topic} has become an active area of development in 2026. This article explains "
            f"what it is and why it matters [1].\n\n"
            f"## How it works\n\nAt its core, {topic} relies on well-documented principles [2].\n\n"
            f"## Why it matters\n\nThe benefits are increasingly clear [1][2].\n\n"
            f"## Challenges and outlook\n\nChallenges remain; near-term dominance is unproven.\n\n"
            f"## Conclusion\n\n{topic} is worth watching closely.\n\n"
            f"## References\n\n"
            f"1. Overview of {topic} — https://example.com/overview\n"
            f"2. {topic}: recent developments — https://example.org/recent\n"
        )

    if "evaluation agent" in s:
        return json.dumps({
            "factuality": 88,
            "citation_quality": 82,
            "readability": 90,
            "completeness": 85,
            "seo_quality": 80,
            "overall_score": 85,
            "issues": ["One claim relies on a single source.", "Could add one more recent statistic."],
        })

    # Generic fallback.
    return json.dumps({"text": f"Mock response about {topic}."})
