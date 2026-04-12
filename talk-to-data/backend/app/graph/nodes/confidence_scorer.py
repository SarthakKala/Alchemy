"""Heuristic confidence from interpretation signals (not sample size alone)."""

from app.graph.state import GraphState

HEDGE_PHRASES = [
    "i assumed",
    "likely refers to",
    "may represent",
    "could mean",
    "approximately",
    "it appears",
    "seems to be",
    "probably",
]


def score_confidence(state: GraphState) -> GraphState:
    """Assign high / medium / low with a short reason."""
    if state.get("error"):
        return {
            **state,
            "confidence": "low",
            "confidence_reason": f"Pipeline error: {state['error']}",
        }

    row_count = state.get("row_count", 0)
    is_valid = state.get("is_sql_valid", False)

    if not is_valid or row_count == 0:
        return {
            **state,
            "confidence": "low",
            "confidence_reason": "No matching data found or SQL could not be validated.",
        }

    answer = (state.get("answer_text") or "").lower()
    llm_hedged = any(phrase in answer for phrase in HEDGE_PHRASES)

    time_was_inferred = bool(
        state.get("clarification_resolved") and not state.get("is_ambiguous")
    )

    reasons = []
    if llm_hedged:
        reasons.append("answer contains inferred language")
    if time_was_inferred:
        reasons.append("time period was inferred from server date")
    if row_count < 5:
        reasons.append(f"only {row_count} row(s) matched — verify the filter")

    if not reasons:
        return {
            **state,
            "confidence": "high",
            "confidence_reason": (
                f"Exact match path, SQL validated, {row_count} rows returned."
            ),
        }

    if len(reasons) >= 2 or llm_hedged:
        return {
            **state,
            "confidence": "low",
            "confidence_reason": "Multiple signals suggest interpretation uncertainty: "
            + "; ".join(reasons),
        }

    return {
        **state,
        "confidence": "medium",
        "confidence_reason": "Result is plausible but verify: " + "; ".join(reasons),
    }
