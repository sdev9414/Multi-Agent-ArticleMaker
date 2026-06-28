"""The six pipeline agents, in execution order."""
from agents.research_agent import ResearchAgent
from agents.fact_checker_agent import FactCheckerAgent
from agents.editor_agent import EditorAgent
from agents.seo_agent import SeoAgent
from agents.publisher_agent import PublisherAgent
from agents.evaluator_agent import EvaluatorAgent

# Order matters: this is the pipeline sequence.
AGENT_CLASSES = [
    ResearchAgent,
    FactCheckerAgent,
    EditorAgent,
    SeoAgent,
    PublisherAgent,
    EvaluatorAgent,
]

__all__ = [
    "ResearchAgent", "FactCheckerAgent", "EditorAgent",
    "SeoAgent", "PublisherAgent", "EvaluatorAgent", "AGENT_CLASSES",
]
