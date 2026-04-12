"""Reject unsafe SQL; validate with EXPLAIN on the session engine."""

import re

from sqlalchemy import text

from app.core.database import get_session
from app.graph.state import GraphState

DANGEROUS_KEYWORDS = [
    "DROP",
    "DELETE",
    "INSERT",
    "UPDATE",
    "ALTER",
    "CREATE",
    "TRUNCATE",
    "EXEC",
    "EXECUTE",
    "PRAGMA",
]


def validate_sql(state: GraphState) -> GraphState:
    """Allow only SELECT; block dangerous keywords; EXPLAIN to verify syntax."""
    sql = state.get("generated_sql", "")

    if not sql:
        return {**state, "is_sql_valid": False, "sql_error": "No SQL was generated."}

    engine = get_session(state["session_id"])
    if not engine:
        return {
            **state,
            "is_sql_valid": False,
            "sql_error": "Session not found.",
        }

    sql_upper = sql.upper().strip()

    if not sql_upper.startswith("SELECT"):
        return {
            **state,
            "is_sql_valid": False,
            "sql_error": "Only SELECT queries are permitted.",
        }

    for keyword in DANGEROUS_KEYWORDS:
        if re.search(rf"\b{keyword}\b", sql_upper):
            return {
                **state,
                "is_sql_valid": False,
                "sql_error": f"Keyword '{keyword}' is not allowed.",
            }

    try:
        with engine.connect() as conn:
            conn.execute(text(f"EXPLAIN {sql}"))
    except Exception as e:
        return {
            **state,
            "is_sql_valid": False,
            "sql_error": f"SQL syntax error: {str(e)}",
        }

    return {**state, "is_sql_valid": True, "sql_error": None}
