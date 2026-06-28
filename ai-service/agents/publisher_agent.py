"""Publisher agent — produces final publish-ready Markdown with references."""
from __future__ import annotations

import json

from agents.base import BaseAgent
from prompts import load_prompt


class PublisherAgent(BaseAgent):
    name = "publisher"

    def run(self, state: dict) -> dict:
        verified = state.get("verified_claims", [])
        # Ordered, deduped citation sources for the References section.
        cited_urls, refs = [], []
        for claim in verified:
            url = claim.get("source_url")
            if url and url not in cited_urls:
                cited_urls.append(url)

        sources_by_url = {s.get("url"): s for s in state.get("sources", [])}
        for i, url in enumerate(cited_urls, 1):
            src = sources_by_url.get(url, {})
            title = src.get("title") or url
            refs.append({"n": i, "title": title, "url": url})

        prompt = (
            f"topic: {state['topic']}\n\n"
            f"SEO:\n{json.dumps(state.get('seo', {}), indent=2)}\n\n"
            f"DRAFT:\n{state.get('draft', '')}\n\n"
            f"ORDERED SOURCES FOR REFERENCES:\n{json.dumps(refs, indent=2)}"
        )
        markdown = self.complete_text(prompt, load_prompt("publisher"))
        return {"final_article": markdown.strip()}
