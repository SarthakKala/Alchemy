"""Typed state for the LangGraph pipeline."""

from typing import Any, Dict, List, Optional, TypedDict


class GraphState(TypedDict, total=False):
    session_id: str
    user_query: str
    table_name: str

    intent: Optional[str]
    is_ambiguous: Optional[bool]
    clarification_question: Optional[str]
    clarification_resolved: Optional[bool]
    resolved_query: Optional[str]

    schema_info: Optional[Dict]
    metric_definitions: Optional[Dict[str, str]]
    enriched_context: Optional[str]

    generated_sql: Optional[str]
    is_sql_valid: Optional[bool]
    sql_error: Optional[str]

    raw_results: Optional[List[Dict[str, Any]]]
    row_count: Optional[int]
    columns_used: Optional[List[str]]

    answer_text: Optional[str]
    chart_type: Optional[str]
    chart_data: Optional[List[Dict]]
    confidence: Optional[str]
    confidence_reason: Optional[str]

    error: Optional[str]
