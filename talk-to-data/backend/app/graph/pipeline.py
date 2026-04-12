"""LangGraph: intent → ambiguity → semantics → SQL → validate → execute → format → confidence."""

from langgraph.graph import END, StateGraph

from app.graph.nodes.ambiguity_resolver import resolve_ambiguity
from app.graph.nodes.answer_formatter import format_answer
from app.graph.nodes.confidence_scorer import score_confidence
from app.graph.nodes.executor import execute_sql
from app.graph.nodes.intent_classifier import classify_intent
from app.graph.nodes.semantic_enricher import enrich_with_semantics
from app.graph.nodes.sql_generator import generate_sql
from app.graph.nodes.sql_validator import validate_sql
from app.graph.state import GraphState


def should_stop_for_ambiguity(state: GraphState) -> str:
    if state.get("is_ambiguous") and not state.get("clarification_resolved"):
        return "stop_ambiguous"
    return "continue"


def should_stop_for_invalid_sql(state: GraphState) -> str:
    if state.get("error"):
        return "stop_invalid"
    if not state.get("is_sql_valid"):
        return "stop_invalid"
    return "continue"


def should_stop_after_sql_gen(state: GraphState) -> str:
    if state.get("error"):
        return "stop"
    return "continue"


def should_continue_after_semantics(state: GraphState) -> str:
    if state.get("error"):
        return "stop"
    return "continue"


def build_pipeline():
    graph = StateGraph(GraphState)

    graph.add_node("intent_classifier", classify_intent)
    graph.add_node("ambiguity_resolver", resolve_ambiguity)
    graph.add_node("semantic_enricher", enrich_with_semantics)
    graph.add_node("sql_generator", generate_sql)
    graph.add_node("sql_validator", validate_sql)
    graph.add_node("executor", execute_sql)
    graph.add_node("answer_formatter", format_answer)
    graph.add_node("confidence_scorer", score_confidence)

    graph.set_entry_point("intent_classifier")
    graph.add_edge("intent_classifier", "ambiguity_resolver")

    graph.add_conditional_edges(
        "ambiguity_resolver",
        should_stop_for_ambiguity,
        {"stop_ambiguous": END, "continue": "semantic_enricher"},
    )

    graph.add_conditional_edges(
        "semantic_enricher",
        should_continue_after_semantics,
        {"stop": END, "continue": "sql_generator"},
    )

    graph.add_conditional_edges(
        "sql_generator",
        should_stop_after_sql_gen,
        {"stop": END, "continue": "sql_validator"},
    )

    graph.add_conditional_edges(
        "sql_validator",
        should_stop_for_invalid_sql,
        {"stop_invalid": END, "continue": "executor"},
    )

    graph.add_edge("executor", "answer_formatter")
    graph.add_edge("answer_formatter", "confidence_scorer")
    graph.add_edge("confidence_scorer", END)

    return graph.compile()


pipeline = build_pipeline()
