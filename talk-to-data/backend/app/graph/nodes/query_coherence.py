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
    explain describe display insight overview report filter sort
    """.split()
)

# If any of these appear as words, we treat the query as plausibly intentional.
_QUESTION_HINT = re.compile(
    r"(?i)\b("
    r"what|how|which|why|when|where|who|whom|whose|show|list|display|find|get|give|tell|"
    r"explain|describe|compare|summarize|summarise|breakdown|break|total|sum|average|mean|median|"
    r"count|max|min|top|bottom|revenue|sales|cost|profit|margin|branch|region|product|customer|"
    r"transaction|chart|graph|plot|table|column|row|filter|sort|group|between|versus|vs|"
    r"year|month|week|day|quarter|growth|trend|distribution|percentage|ratio|share|amount|"
    r"value|number|data|metric|kpi|insight|overview|report|dataset|field|record|upload|csv"
    r")\b"
)


def _bigram_ratio(s: str) -> float:
    s = re.sub(r"[^a-z]", "", s.lower())
    if len(s) < 2:
        return 0.0
    hits = sum(1 for i in range(len(s) - 1) if s[i : i + 2] in _COMMON_BIGRAMS)
    return hits / (len(s) - 1)


def _max_consonant_run(word: str) -> int:
    vowels = frozenset("aeiouy")
    run = max_run = 0
    for c in word.lower():
        if c.isalpha() and c not in vowels:
            run += 1
            max_run = max(max_run, run)
        else:
            run = 0
    return max_run


def _word_plausible(w: str) -> bool:
    if len(w) <= 2:
        return True
    wl = w.lower()
    vowels = sum(1 for c in wl if c in "aeiouy")
    if vowels == 0:
        return False
    ratio = vowels / len(wl)
    if len(wl) >= 6 and (ratio < 0.18 or ratio > 0.72):
        return False
    if _max_consonant_run(wl) >= 6:
        return False
    return True


def _heuristic_incoherent(query: str) -> bool:
    """
    Deterministic gibberish detector. Tuned to fail closed on mash text.
    """
    q = (query or "").strip()
    if len(q) < 2:
        return True

    # Clear intent: common analytics / question vocabulary
    if _QUESTION_HINT.search(q):
        return False

    qnorm = re.sub(r"[^a-zA-Z\s]", " ", q).lower()
    qnorm = re.sub(r"\s+", " ", qnorm).strip()
    words = [w for w in qnorm.split() if w]
    if not words:
        return True

    for w in words:
        if w in _LEXICON:
            return False

    compact = re.sub(r"\s+", "", qnorm)
    ratio = _bigram_ratio(compact)
    plausible_words = sum(1 for w in words if _word_plausible(w))

    # Long random-looking tokens without any question vocabulary
    if len(words) >= 1 and all(len(w) >= 9 for w in words) and plausible_words == 0:
        return True

    if plausible_words == 0 and len(compact) >= 8:
        return True

    # Low English digram density (keyboard mash / random caps)
    if len(compact) >= 10 and ratio < 0.10:
        return True

    # Longer strings with weak English-like digrams
    if len(compact) >= 14 and ratio < 0.108:
        return True

    # Mostly implausible “words” and weak bigram signal
    if len(words) >= 2 and plausible_words <= len(words) // 2 and ratio < 0.115:
        return True

    # No question words: multiple chunky tokens only (typical mash / random caps)
    if not _QUESTION_HINT.search(q) and len(words) >= 2:
        lengths = [len(w) for w in words]
        avg_len = sum(lengths) / len(lengths)
        if min(lengths) >= 6 and avg_len >= 9 and max(lengths) >= 10:
            return True

    # Single very long blob (no spaces) of nonsense
    if len(words) == 1 and len(words[0]) >= 18 and ratio < 0.12:
        return True

    return False


_COHERENCE_PROMPT = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            """You gate messages for a CSV / spreadsheet analytics chatbot.

Output ONLY one JSON object on one line: {{"coherent":true}} or {{"coherent":false}}

Set coherent=FALSE when ANY of these hold:
- Random letters, keyboard mashing, or meaningless tokens (e.g. RAHUCIL ARUEBASILB GASRLUISRGAFBGSH)
- No recognizable attempt to ask about numbers, categories, tables, metrics, time, or comparisons
- Only nonsense words that are not English (or clearly garbled beyond typos)

Set coherent=TRUE ONLY when the user clearly tries to ask about data in readable words — including informal English and typos.

When unsure, prefer {{"coherent":false}}.""",
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

    # 1) Deterministic gate always runs first — catches mash before any LLM can wrongly approve.
    if _heuristic_incoherent(q):
        logger.info("Query rejected by heuristic incoherence gate.")
        return _incoherent_payload(state)

    # 2) Optional LLM second opinion when API key present (must also pass).
    if settings.OPENROUTER_API_KEY:
        try:
            if not _llm_coherent(q):
                logger.info("Query rejected by LLM coherence gate.")
                return _incoherent_payload(state)
        except Exception as e:
            logger.warning("LLM coherence failed (%s); accepting heuristic pass only.", e)

    return {**state, "incoherent": False}
