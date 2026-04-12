"""Run validated SQL and return row dicts."""

from sqlalchemy import text

from app.core.database import get_session
from app.graph.state import GraphState
from app.utils.json_safe import json_safe_row


def execute_sql(state: GraphState) -> GraphState:
    """Execute SELECT and cap rows at 500."""
    if not state.get("is_sql_valid"):
        return {**state, "error": state.get("sql_error", "Invalid SQL")}

    engine = get_session(state["session_id"])
    if not engine:
        return {**state, "error": "Session not found"}

    try:
        with engine.connect() as conn:
            result = conn.execute(text(state["generated_sql"]))
            columns = list(result.keys())
            rows = result.fetchmany(500)

        raw_results = [
            json_safe_row(dict(zip(columns, row))) for row in rows
        ]

        return {
            **state,
            "raw_results": raw_results,
            "row_count": len(raw_results),
            "columns_used": columns,
        }
    except Exception as e:
        return {**state, "error": f"Query execution failed: {str(e)}"}
