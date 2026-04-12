"""Resolve common time phrases; only stop on genuinely vague wording."""

import re
from datetime import datetime, timedelta

from app.graph.state import GraphState


def _last_month(now: datetime) -> str:
    first = now.replace(day=1)
    end_prev = first - timedelta(days=1)
    return end_prev.strftime("%B %Y")


def _last_quarter(now: datetime) -> str:
    q = (now.month - 1) // 3 + 1
    if q == 1:
        return f"Q4 {now.year - 1}"
    return f"Q{q - 1} {now.year}"


AUTO_RESOLVABLE = {
    "this month": lambda now: now.strftime("%B %Y"),
    "last month": lambda now: _last_month(now),
    "this year": lambda now: str(now.year),
    "last year": lambda now: str(now.year - 1),
    "this week": lambda now: f"week of {now.strftime('%d %B %Y')}",
    "last week": lambda now: f"week before {now.strftime('%d %B %Y')}",
    "today": lambda now: now.strftime("%d %B %Y"),
    "yesterday": lambda now: (now - timedelta(days=1)).strftime("%d %B %Y"),
    "this quarter": lambda now: f"Q{(now.month - 1) // 3 + 1} {now.year}",
    "last quarter": lambda now: _last_quarter(now),
}

TRULY_AMBIGUOUS = [
    "recently",
    "last cycle",
    "last period",
    "previous period",
    "a while back",
]


def resolve_ambiguity(state: GraphState) -> GraphState:
    """
    Auto-expand casual time phrases into explicit text for SQL generation.
    Only set is_ambiguous for vague phrases with no anchor.
    """
    if state.get("clarification_resolved"):
        return {**state, "is_ambiguous": False}

    now = datetime.now()
    query = state["user_query"]
    query_lower = query.lower()

    resolved = query
    for phrase, resolver in AUTO_RESOLVABLE.items():
        if phrase in query_lower:
            resolved_date = resolver(now)
            pattern = re.compile(re.escape(phrase), re.IGNORECASE)
            resolved = pattern.sub(resolved_date, resolved)

    if resolved != query:
        return {
            **state,
            "is_ambiguous": False,
            "resolved_query": resolved,
            "clarification_resolved": True,
        }

    for phrase in TRULY_AMBIGUOUS:
        if phrase in query_lower:
            date_hint = f" (Today is {now.strftime('%d %B %Y')}.)"
            return {
                **state,
                "is_ambiguous": True,
                "clarification_question": (
                    f"You used '{phrase}' — could you specify the exact time period you meant?{date_hint}"
                ),
            }

    return {**state, "is_ambiguous": False}
