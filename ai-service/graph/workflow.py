"""
LangGraph workflow: Research → Fact Checker → Editor → SEO → Publisher → Evaluator.

Each node is an agent's `execute`, which mutates shared WorkflowState in place and
records its own observability. The graph is linear; failures are captured per agent
(state['errors']) rather than crashing the run, so downstream agents and the final
response still return useful partial output.
"""
from __future__ import annotations

import logging
import time

from langgraph.graph import StateGraph, END

from agents import AGENT_CLASSES
from graph.state import WorkflowState

logger = logging.getLogger("workflow")


def _make_node(agent_cls):
    """Wrap an agent class as a graph node. Instantiated per run for clean token counters."""
    def node(state: WorkflowState) -> WorkflowState:
        return agent_cls().execute(state)
    node.__name__ = agent_cls.name.replace("-", "_")
    return node


def build_graph():
    """Compile the linear agent pipeline into a runnable graph."""
    graph = StateGraph(WorkflowState)
    # Node ids are prefixed so they never collide with state keys (e.g. "seo").
    names = [f"agent_{cls.name}".replace("-", "_") for cls in AGENT_CLASSES]

    for cls, node_name in zip(AGENT_CLASSES, names):
        graph.add_node(node_name, _make_node(cls))

    graph.set_entry_point(names[0])
    for a, b in zip(names, names[1:]):
        graph.add_edge(a, b)
    graph.add_edge(names[-1], END)

    return graph.compile()


# Compile once at import; the graph is stateless across runs.
_COMPILED = build_graph()


def run_workflow(topic: str, article_type: str, audience: str) -> dict:
    """Execute the full pipeline and return the final enriched state + run summary."""
    initial: WorkflowState = {
        "topic": topic,
        "article_type": article_type,
        "audience": audience,
        "sources": [],
        "research_notes": [],
        "extracted_facts": [],
        "verified_claims": [],
        "rejected_claims": [],
        "weak_evidence": [],
        "outline": "",
        "draft": "",
        "seo": {},
        "final_article": "",
        "evaluation": {},
        "agent_runs": [],
        "errors": [],
        "completed_agents": [],
        "current_agent": None,
    }

    start = time.perf_counter()
    final = _COMPILED.invoke(initial)
    duration_ms = int((time.perf_counter() - start) * 1000)

    runs = final.get("agent_runs", [])
    final["duration_ms"] = duration_ms
    final["total_tokens"] = sum(r["tokens_input"] + r["tokens_output"] for r in runs)
    final["total_cost_usd"] = round(sum(r["cost_usd"] for r in runs), 5)
    final["current_agent"] = None
    return final
