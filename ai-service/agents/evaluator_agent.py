"""Evaluator agent — scores the finished article. Returns structured JSON only."""
from __future__ import annotations

import json

from agents.base import BaseAgent
from prompts import load_prompt


def _clamp(v) -> int:
    try:
        return max(0, min(100, int(v)))
    except (TypeError, ValueError):
        return 0


class EvaluatorAgent(BaseAgent):
    name = "evaluator"
    tier = "strong"  # scoring factuality/quality is a judgment task

    def run(self, state: dict) -> dict:
        prompt = (
            f"topic: {state['topic']}\n\n"
            f"FINAL ARTICLE:\n{state.get('final_article', '')[:6000]}\n\n"
            f"VERIFIED CLAIMS:\n{json.dumps(state.get('verified_claims', []), indent=2)}\n\n"
            f"SEO:\n{json.dumps(state.get('seo', {}), indent=2)}"
        )
        data = self.complete_json(prompt, load_prompt("evaluator"))

        dims = ["factuality", "citation_quality", "readability", "completeness", "seo_quality"]
        scores = {d: _clamp(data.get(d)) for d in dims}
        overall = data.get("overall_score")
        # Trust the model's overall if present, else compute the average.
        scores["overall_score"] = _clamp(overall) if overall else round(sum(scores.values()) / len(dims))
        scores["issues"] = data.get("issues", [])

        return {"evaluation": scores}
