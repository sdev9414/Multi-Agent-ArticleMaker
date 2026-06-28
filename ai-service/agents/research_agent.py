"""Research agent — searches, collects sources, dedupes, summarizes. Never writes the article."""
from __future__ import annotations

import json

from agents.base import BaseAgent
from prompts import load_prompt
from services.search import search


class ResearchAgent(BaseAgent):
    name = "research"

    def run(self, state: dict) -> dict:
        topic = state["topic"]
        results = search(topic, max_results=6)

        # Dedupe search hits by URL before handing them to the model.
        seen, deduped = set(), []
        for r in results:
            url = r.get("url")
            if url and url not in seen:
                seen.add(url)
                deduped.append(r)

        prompt = (
            f"topic: {topic}\n"
            f"article_type: {state.get('article_type')}\n"
            f"audience: {state.get('audience')}\n\n"
            f"SEARCH RESULTS (JSON):\n{json.dumps(deduped, indent=2)}"
        )
        data = self.complete_json(prompt, load_prompt("research"))

        return {
            "sources": data.get("sources", []),
            "research_notes": data.get("research_notes", []),
            "extracted_facts": data.get("extracted_facts", []),
        }
