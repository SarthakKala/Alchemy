"""Pick chart type from intent and result columns."""

from typing import List, Optional


def select_chart_type(intent: Optional[str], columns: List[str]) -> str:
    """
    Return one of: bar, line, pie, stat.
    """
    if len(columns) <= 1:
        return "stat"

    if intent == "compare":
        date_hints = ["date", "week", "month", "year", "time", "period"]
        if any(hint in col.lower() for col in columns for hint in date_hints):
            return "line"
        return "bar"

    if intent == "breakdown":
        return "pie"

    if intent == "change":
        return "bar"

    if intent == "summary":
        return "stat"

    return "bar"
