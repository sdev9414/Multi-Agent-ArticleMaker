"""Fact Checker agent — verifies claims against sources, attaches citations. Never invents citations."""
from __future__ import annotations

import json

from agents.base import BaseAgent
from prompts import load_prompt


class FactCheckerAgent(BaseAgent):
    name = "fact-checker"

    def run(self, state: dict) -> dict:
        prompt = (
            f"topic: {state['topic']}\n\n"
            f"EXTRACTED FACTS:\n{json.dumps(state.get('extracted_facts', []), indent=2)}\n\n"
            f"RESEARCH NOTES:\n{json.dumps(state.get('research_notes', []), indent=2)}\n\n"
            f"SOURCES:\n{json.dumps(state.get('sources', []), indent=2)}"
        )
        data = self.complete_json(prompt, load_prompt("fact_checker"))

        return {
            "verified_claims": data.get("verified_claims", []),
            "rejected_claims": data.get("rejected_claims", []),
            "weak_evidence": data.get("weak_evidence", []),
        }
