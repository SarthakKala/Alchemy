"""NL query pipeline endpoint."""

import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()


class QueryRequest(BaseModel):
    session_id: str
    table_name: str
    user_query: str
    clarification_resolved: bool | None = False
    resolved_query: str | None = None


@router.post("/")
async def run_query(request: QueryRequest):
    """Run LangGraph NL → SQL → answer pipeline."""
    # Lazy import so uvicorn can bind before LangChain/LangGraph load (large on Windows).
    from app.graph.pipeline import pipeline

    initial_state = {
        "session_id": request.session_id,
        "user_query": request.user_query,
        "table_name": request.table_name,
        "clarification_resolved": request.clarification_resolved,
        "resolved_query": request.resolved_query,
        "intent": None,
        "is_ambiguous": None,
        "clarification_question": None,
        "schema_info": None,
        "metric_definitions": None,
        "enriched_context": None,
        "generated_sql": None,
        "is_sql_valid": None,
        "sql_error": None,
        "raw_results": None,
        "row_count": None,
        "columns_used": None,
        "answer_text": None,
        "chart_type": None,
        "chart_data": None,
        "confidence": None,
        "confidence_reason": None,
        "error": None,
    }

    try:
        result = pipeline.invoke(initial_state)
    except httpx.HTTPStatusError as e:
        if e.response is not None and e.response.status_code == 429:
            raise HTTPException(
                status_code=429,
                detail={
                    "message": "High demand right now. Please retry in 10 seconds.",
                    "retry_after": 10,
                },
            ) from e
        raise HTTPException(status_code=500, detail=f"LLM request failed: {str(e)}") from e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pipeline error: {str(e)}") from e

    return result
