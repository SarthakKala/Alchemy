"""Natural language → SQL via OpenRouter (Llama)."""

import re

from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from sqlalchemy import inspect as sa_inspect
from sqlalchemy.engine import Engine

from app.core.config import settings
from app.core.database import get_session
from app.graph.state import GraphState


def get_table_schema_string(engine: Engine, table_name: str) -> str:
    """Build CREATE TABLE-like description for the prompt."""
    insp = sa_inspect(engine)
    cols = insp.get_columns(table_name)
    col_defs = ", ".join([f'"{c["name"]}" {c["type"]}' for c in cols])
    return f'CREATE TABLE "{table_name}" ({col_defs})'


SQL_PROMPT = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            """You are an expert SQL analyst. Convert natural language questions into valid SQL.

RULES:
- Only generate SELECT statements. NEVER use INSERT, UPDATE, DELETE, DROP, ALTER, CREATE.
- Use only the provided table and column names. Double-quote identifiers if they need it.
- For aggregations, include GROUP BY when selecting non-aggregated columns.
- Return ONLY the SQL query — no explanation, no markdown, no backticks.

TABLE SCHEMA:
{schema}

{metric_context}

INTENT: {intent}
""",
        ),
        ("human", "{query}"),
    ]
)


def generate_sql(state: GraphState) -> GraphState:
    """Generate SQL; prefers resolved_query after ambiguity handling."""
    if state.get("error"):
        return state

    engine = get_session(state["session_id"])
    if not engine:
        return {**state, "error": "Session not found"}

    if not settings.OPENROUTER_API_KEY:
        return {**state, "error": "OPENROUTER_API_KEY is not configured."}

    schema_str = get_table_schema_string(engine, state["table_name"])
    query_to_use = state.get("resolved_query") or state["user_query"]

    llm = ChatOpenAI(
        base_url=settings.OPENROUTER_BASE_URL,
        api_key=settings.OPENROUTER_API_KEY,
        model=settings.LLM_MODEL,
        temperature=0,
    )

    chain = SQL_PROMPT | llm | StrOutputParser()

    try:
        sql = chain.invoke(
            {
                "schema": schema_str,
                "metric_context": state.get("enriched_context", ""),
                "intent": state.get("intent", "breakdown"),
                "query": query_to_use,
            }
        )
        sql = re.sub(r"```sql|```", "", sql).strip()
        return {**state, "generated_sql": sql}
    except Exception as e:
        return {**state, "error": f"SQL generation failed: {str(e)}"}
