"""Turn result rows into plain-English answer + chart hints."""

import json

from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

from app.core.config import settings
from app.graph.state import GraphState
from app.utils.chart_selector import select_chart_type

FORMAT_PROMPT = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            """You are a data analyst explaining results to a non-technical business user.

RULES:
- Write 2-4 sentences maximum.
- Use plain English with no SQL, technical terms, or jargon.
- Always mention the specific numbers from the data.
- End with one actionable insight or observation.
- Do not say "based on the data" or "the query returned" — state the finding directly.
""",
        ),
        (
            "human",
            """Original question: {question}

Query intent: {intent}

Raw results from the database:
{results}

Write a plain English answer.""",
        ),
    ]
)


def format_answer(state: GraphState) -> GraphState:
    """LLM narrative + chart type from intent/columns."""
    if state.get("error"):
        return state

    raw = state.get("raw_results") or []
    if not raw:
        return {
            **state,
            "answer_text": "No data matched your query. Try rephrasing or checking the date range.",
            "chart_type": "stat",
            "chart_data": [],
        }

    if not settings.OPENROUTER_API_KEY:
        return {
            **state,
            "answer_text": "Results retrieved, but OPENROUTER_API_KEY is missing for narration.",
            "chart_type": select_chart_type(state.get("intent"), state.get("columns_used") or []),
            "chart_data": raw[:50],
        }

    llm = ChatOpenAI(
        base_url=settings.OPENROUTER_BASE_URL,
        api_key=settings.OPENROUTER_API_KEY,
        model=settings.LLM_MODEL,
        temperature=0.3,
    )

    chain = FORMAT_PROMPT | llm | StrOutputParser()

    try:
        answer = chain.invoke(
            {
                "question": state["user_query"],
                "intent": state.get("intent", "breakdown"),
                "results": json.dumps(raw[:20], indent=2),
            }
        )
        chart_type = select_chart_type(
            state.get("intent"), state.get("columns_used") or []
        )
        return {
            **state,
            "answer_text": answer,
            "chart_type": chart_type,
            "chart_data": raw[:50],
        }
    except Exception as e:
        return {**state, "error": f"Answer formatting failed: {str(e)}"}
