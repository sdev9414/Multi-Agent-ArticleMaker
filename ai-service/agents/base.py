"""
Base agent: shared execution scaffolding so each agent only writes its own logic.

An agent implements `run(state) -> dict` returning ONLY the state fields it owns.
`execute` wraps that with timing, token/cost accounting, an agent_run record,
and failure capture — the observability every agent needs.
"""
from __future__ import annotations

import logging
import time
from abc import ABC, abstractmethod

from services.llm import get_client, LLMResult
from utils.cost import estimate_cost

logger = logging.getLogger("agent")


class BaseAgent(ABC):
    #: short stable id, e.g. "research". Set by each subclass.
    name: str = "agent"

    def __init__(self):
        self.client = get_client()
        self._tokens_in = 0
        self._tokens_out = 0
        self._retries = 0

    @abstractmethod
    def run(self, state: dict) -> dict:
        """Return the state fields this agent owns. May call self.complete*()."""

    # ── helpers agents call ────────────────────────────────────────────────
    def complete_json(self, prompt: str, system: str):
        parsed, result = self.client.complete_json(prompt, system)
        self._account(result)
        return parsed

    def complete_text(self, prompt: str, system: str) -> str:
        result = self.client.complete(prompt, system)
        self._account(result)
        return result.text

    def _account(self, result: LLMResult) -> None:
        self._tokens_in += result.tokens_input
        self._tokens_out += result.tokens_output

    # ── orchestrator entry point ───────────────────────────────────────────
    def execute(self, state: dict) -> dict:
        """Run the agent, merge its output into state, append an agent_run record."""
        state["current_agent"] = self.name
        start = time.perf_counter()
        status = "completed"
        error = None
        produced: dict = {}

        try:
            logger.info("Agent %s starting", self.name)
            produced = self.run(state)
        except Exception as exc:  # noqa: BLE001 — record, don't crash the pipeline
            status = "failed"
            error = str(exc)
            logger.error("Agent %s failed: %s", self.name, exc)
            state.setdefault("errors", []).append(f"{self.name}: {exc}")

        latency_ms = int((time.perf_counter() - start) * 1000)
        cost = estimate_cost(self.client.model, self._tokens_in, self._tokens_out)

        state.setdefault("agent_runs", []).append({
            "agent": self.name,
            "status": status,
            "latency_ms": latency_ms,
            "tokens_input": self._tokens_in,
            "tokens_output": self._tokens_out,
            "cost_usd": cost,
            "retries": self._retries,
            "error": error,
        })

        # Only merge produced fields on success — never clobber on failure.
        if status == "completed":
            state.update(produced)
            state.setdefault("completed_agents", []).append(self.name)

        return state
