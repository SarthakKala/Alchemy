"""Keyword-based intent classification (no LLM)."""

from app.graph.state import GraphState

INTENT_KEYWORDS = {
    "change": [
        "why did",
        "what caused",
        "dropped",
        "increased",
        "fell",
        "rose",
        "change",
        "changed",
        "decline",
        "growth",
        "spike",
        "dip",
    ],
    "compare": [
        "vs",
        "versus",
        "compare",
        "compared to",
        "this week vs",
        "last week vs",
        "region a vs",
        "difference between",
        "better than",
    ],
    "breakdown": [
        "breakdown",
        "break down",
        "what makes up",
        "decompose",
        "by region",
        "by product",
        "by category",
        "by channel",
        "distribution",
        "split",
        "proportion",
        "share",
    ],
    "summary": [
        "summary",
        "summarize",
        "overview",
        "digest",
        "give me a",
        "weekly",
        "monthly",
        "daily",
        "report",
        "highlight",
    ],
}


def classify_intent(state: GraphState) -> GraphState:
    """Classify query into change | compare | breakdown | summary."""
    query = state["user_query"].lower()
    scores = {intent: 0 for intent in INTENT_KEYWORDS}

    for intent, keywords in INTENT_KEYWORDS.items():
        for kw in keywords:
            if kw in query:
                scores[intent] += 1

    best_intent = max(scores, key=scores.get)
    if scores[best_intent] == 0:
        best_intent = "breakdown"

    return {**state, "intent": best_intent}
