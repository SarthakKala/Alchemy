"""Unit tests for graph nodes (no LLM)."""

from app.core.database import create_session
from app.graph.nodes.intent_classifier import classify_intent
from app.graph.nodes.sql_validator import validate_sql


def make_base_state(**kwargs):
    base = {
        "session_id": "test",
        "user_query": "",
        "table_name": "sales",
        "intent": None,
        "is_ambiguous": None,
        "clarification_question": None,
        "clarification_resolved": False,
        "resolved_query": None,
        "schema_info": None,
        "metric_definitions": None,
        "enriched_context": None,
        "generated_sql": None,
        "is_sql_valid": None,
        "sql_error": None,
        "raw_results": None,
        "row_count": None,
        "columns_used": None,
        "answer_text": None,
        "chart_type": None,
        "chart_data": None,
        "confidence": None,
        "confidence_reason": None,
        "error": None,
        "incoherent": None,
    }
    base.update(kwargs)
    return base


def test_intent_classifier_change():
    state = make_base_state(user_query="Why did revenue drop last month?")
    result = classify_intent(state)
    assert result["intent"] == "change"


def test_intent_classifier_compare():
    state = make_base_state(user_query="Compare region A vs region B")
    result = classify_intent(state)
    assert result["intent"] == "compare"


def test_sql_validator_blocks_drop():
    state = make_base_state(generated_sql="DROP TABLE sales")
    result = validate_sql(state)
    assert result["is_sql_valid"] is False


def test_heuristic_flags_obvious_gibberish():
    from app.graph.nodes.query_coherence import _heuristic_incoherent

    assert _heuristic_incoherent("ulhumhuhawe fblsef hlbfELGABS") is True


def test_heuristic_allows_plain_questions():
    from app.graph.nodes.query_coherence import _heuristic_incoherent

    assert _heuristic_incoherent("What is total revenue by branch?") is False
    assert _heuristic_incoherent("Show breakdown of sales by region") is False


def test_sql_validator_allows_select():
    create_session("test-session")
    state = make_base_state(
        session_id="test-session",
        generated_sql="SELECT 1 AS x",
    )
    result = validate_sql(state)
    assert result["is_sql_valid"] is True
