"""Editor agent — builds outline + readable draft from verified claims. Never researches."""
from __future__ import annotations

import json

from agents.base import BaseAgent
from prompts import load_prompt


class EditorAgent(BaseAgent):
    name = "editor"

    def run(self, state: dict) -> dict:
        prompt = (
            f"topic: {state['topic']}\n"
            f"article_type: {state.get('article_type')}\n"
            f"audience: {state.get('audience')}\n\n"
            f"VERIFIED CLAIMS (use only these; citations map to this order):\n"
            f"{json.dumps(state.get('verified_claims', []), indent=2)}\n\n"
            f"RESEARCH NOTES:\n{json.dumps(state.get('research_notes', []), indent=2)}"
        )
        data = self.complete_json(prompt, load_prompt("editor"))

        return {
            "outline": data.get("outline", ""),
            "draft": data.get("draft", ""),
        }
