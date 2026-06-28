"""SEO agent — generates title, meta description, slug, keywords, headings."""
from __future__ import annotations

import re

from agents.base import BaseAgent
from prompts import load_prompt


def slugify(value: str) -> str:
    """URL-safe slug. Enforced here so we never trust model output blindly."""
    value = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return value[:80] or "article"


class SeoAgent(BaseAgent):
    name = "seo"

    def run(self, state: dict) -> dict:
        prompt = (
            f"topic: {state['topic']}\n"
            f"audience: {state.get('audience')}\n\n"
            f"DRAFT:\n{state.get('draft', '')[:4000]}"
        )
        data = self.complete_json(prompt, load_prompt("seo"))

        seo = {
            "title": data.get("title", "") or state["topic"].title(),
            "meta_description": data.get("meta_description", ""),
            "slug": slugify(data.get("slug") or state["topic"]),
            "keywords": data.get("keywords", []),
            "headings": data.get("headings", []),
        }
        return {"seo": seo}
