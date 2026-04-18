"""Reject keyboard mash / gibberish before NL→SQL (saves bad answers + API cost)."""

import json
import logging
import re

from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

from app.core.config import settings
from app.graph.state import GraphState

logger = logging.getLogger(__name__)

# Common English digrams — normal prose scores much higher than random letters.
_COMMON_BIGRAMS = frozenset(
    "th he in er an re on at en nd ti es or te of ed is it al ar st"
    " to nt ng se ha as ou io le ve co me de hi ra ro ic ne ea ma li"
    " fo ri si no pe ci om ta et na ll ur mo la fo ce el na ns ut os"
    " lp ep eb ec et ig id il im ip ir iv iy iz ob od ok ol oo op ot"
    " ox oz ub ud uf uh uk um un up us uw ux uy uz".split()
)

# If the user clearly uses analytics / question vocabulary, do not block.
_LEXICON = frozenset(
    """
    what how which why when where who whose show list find get give tell
    total sum average mean median count max min top bottom compare versus vs
    breakdown split group by filter sort order revenue sales cost profit margin
    branch region product customer channel transaction month week year quarter
    day date time growth change trend drop rise increase decrease difference
    between among over under above below chart graph plot table column row field
    data metric kpi amount value number percent share ratio distribution highest
    lowest first last more less than equal all each per every some any
    """.split()
)


def _bigram_ratio(s: str) -> float:
    s = re.sub(r"[^a-z]", "", s.lower())
    if len(s) < 2:
        return 0.0
    hits = sum(1 for i in range(len(s) - 1) if s[i : i + 2] in _COMMON_BIGRAMS)
    return hits / (len(s) - 1)


def _heuristic_incoherent(query: str) -> bool:
    """No-LLM fallback: catch random strings via digram rarity + vocabulary."""
    qnorm = re.sub(r"[^a-zA-Z\s]", " ", query).lower()
    qnorm = re.sub(r"\s+", " ", qnorm).strip()
    if len(qnorm) < 2:
        return True

    words = qnorm.split()
    for w in words:
        if w in _LEXICON or any(lex in w for lex in ("total", "revenue", "what", "how")):
            return False
        if len(w) >= 4 and w[:4] in ("what", "how", "show", "list", "find", "sum", "avg"):
            return False

    compact = re.sub(r"\s+", "", qnorm)
    if len(compact) < 10:
        return False

    ratio = _bigram_ratio(compact)
    # English-like text typically lands ~0.15–0.35 here; mash strings often < 0.10.
    return ratio < 0.095


_COHERENCE_PROMPT = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            """You gate messages for a CSV analytics chatbot.

Reply with ONLY valid JSON on one line: {"coherent":true} or {"coherent":false}

coherent=true:
  The user is trying to ask something about their data — numbers, categories,
  comparisons, filters, trends, summaries, even with typos or short phrasing.

coherent=false:
  Random keyboard input, meaningless letter sequences, obvious spam with no
  question about data, or strings that are not language attempting a question.""",
        ),
        ("human", "{query}"),
    ]
)


def _llm_coherent(query: str) -> bool:
    llm = ChatOpenAI(
        base_url=settings.OPENROUTER_BASE_URL,
        api_key=settings.OPENROUTER_API_KEY,
        model=settings.LLM_MODEL,
        temperature=0,
    )
    chain = _COHERENCE_PROMPT | llm | StrOutputParser()
    raw = chain.invoke({"query": query}).strip()
    # Strip markdown fences if any
    raw = re.sub(r"^```(?:json)?\s*", "", raw)
    raw = re.sub(r"\s*```$", "", raw)
    m = re.search(r"\{[^}]+\}", raw)
    if m:
        raw = m.group(0)
    data = json.loads(raw)
    return bool(data.get("coherent"))


def _incoherent_payload(state: GraphState) -> GraphState:
    msg = (
        "I couldn't interpret that as a question about your uploaded data. "
        "Try asking in plain English — for example totals, breakdowns by branch or region, "
        "or trends over time."
    )
    return {
        **state,
        "incoherent": True,
        "answer_text": msg,
        "confidence": "low",
        "confidence_reason": "The message did not appear to be a meaningful data question.",
        "generated_sql": None,
        "is_sql_valid": False,
        "sql_error": None,
        "raw_results": [],
        "row_count": 0,
        "columns_used": [],
        "chart_data": [],
        "chart_type": None,
        "error": None,
    }


def check_query_coherence(state: GraphState) -> GraphState:
    """Run first; set incoherent=True to stop the graph before SQL."""
    q = (state.get("user_query") or "").strip()
    if not q:
        return _incoherent_payload(state)

    coherent = True
    try:
        if settings.OPENROUTER_API_KEY:
            coherent = _llm_coherent(q)
        else:
            coherent = not _heuristic_incoherent(q)
    except Exception as e:
        logger.warning("Coherence check failed (%s); falling back to heuristic.", e)
        coherent = not _heuristic_incoherent(q)

    if not coherent:
        return _incoherent_payload(state)

    return {**state, "incoherent": False}
