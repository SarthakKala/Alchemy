"""Attach semantic layer definitions to schema for the LLM."""

from app.core.database import get_session
from app.core.metrics_store import enrich_schema_with_metrics
from app.graph.state import GraphState
from app.utils.schema_detector import detect_schema


def enrich_with_semantics(state: GraphState) -> GraphState:
    """Load schema + metric definitions into state."""
    engine = get_session(state["session_id"])
    if not engine:
        return {**state, "error": "Session not found"}

    schema_info = detect_schema(engine, state["table_name"])
    all_columns = (
        schema_info["numeric_columns"]
        + schema_info["categorical_columns"]
        + schema_info["date_columns"]
        + schema_info["text_columns"]
    )

    metric_defs = enrich_schema_with_metrics(all_columns)

    context_lines = ["Column definitions:"]
    for col, definition in metric_defs.items():
        context_lines.append(f"  - {col}: {definition}")

    if not metric_defs:
        context_lines.append("  (No predefined metrics matched. Use column names as-is.)")

    enriched_context = "\n".join(context_lines)

    return {
        **state,
        "schema_info": schema_info,
        "metric_definitions": metric_defs,
        "enriched_context": enriched_context,
    }
