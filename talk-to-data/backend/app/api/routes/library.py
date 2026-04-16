"""Query library routes: save, list, replay, delete saved queries."""

from datetime import datetime, timezone
from typing import List, Optional
import uuid

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from sqlalchemy import text

from app.core.database import get_session

router = APIRouter()


def _ensure_library_table(engine) -> None:
    """Create query_library table if it does not exist."""
    with engine.connect() as conn:
        conn.execute(
            text(
                """
                CREATE TABLE IF NOT EXISTS query_library (
                    id         TEXT PRIMARY KEY,
                    name       TEXT NOT NULL,
                    query_text TEXT NOT NULL,
                    intent     TEXT,
                    use_count  INTEGER DEFAULT 1,
                    created_at TEXT NOT NULL,
                    last_used  TEXT NOT NULL
                )
                """
            )
        )
        conn.commit()


class SaveQueryRequest(BaseModel):
    session_id: str
    name: str
    query_text: str
    intent: Optional[str] = None


class SavedQuery(BaseModel):
    id: str
    name: str
    query_text: str
    intent: Optional[str]
    use_count: int
    created_at: str
    last_used: str


@router.post("/", response_model=SavedQuery)
def save_query(req: SaveQueryRequest):
    """Save a query in the personal library."""
    engine = get_session(req.session_id)
    if not engine:
        raise HTTPException(status_code=404, detail="Session not found.")

    _ensure_library_table(engine)
    now = datetime.now(timezone.utc).isoformat()
    entry_id = str(uuid.uuid4())

    with engine.connect() as conn:
        conn.execute(
            text(
                """
                INSERT INTO query_library (id, name, query_text, intent, use_count, created_at, last_used)
                VALUES (:id, :name, :query_text, :intent, 1, :created_at, :last_used)
                """
            ),
            {
                "id": entry_id,
                "name": req.name,
                "query_text": req.query_text,
                "intent": req.intent,
                "created_at": now,
                "last_used": now,
            },
        )
        conn.commit()

    return SavedQuery(
        id=entry_id,
        name=req.name,
        query_text=req.query_text,
        intent=req.intent,
        use_count=1,
        created_at=now,
        last_used=now,
    )


@router.get("/", response_model=List[SavedQuery])
def get_library(session_id: str):
    """Get saved queries ordered by most recently used."""
    engine = get_session(session_id)
    if not engine:
        raise HTTPException(status_code=404, detail="Session not found.")

    _ensure_library_table(engine)
    with engine.connect() as conn:
        rows = conn.execute(
            text("SELECT * FROM query_library ORDER BY last_used DESC")
        ).fetchall()

    return [SavedQuery(**dict(row._mapping)) for row in rows]


@router.delete("/{query_id}")
def delete_saved_query(query_id: str, session_id: str):
    """Delete a saved query entry by id."""
    engine = get_session(session_id)
    if not engine:
        raise HTTPException(status_code=404, detail="Session not found.")

    with engine.connect() as conn:
        conn.execute(
            text("DELETE FROM query_library WHERE id = :id"),
            {"id": query_id},
        )
        conn.commit()

    return {"deleted": query_id}


@router.post("/{query_id}/replay", response_model=SavedQuery)
def replay_query(query_id: str, session_id: str):
    """Increment usage metadata and return the saved query."""
    engine = get_session(session_id)
    if not engine:
        raise HTTPException(status_code=404, detail="Session not found.")

    now = datetime.now(timezone.utc).isoformat()
    with engine.connect() as conn:
        conn.execute(
            text(
                """
                UPDATE query_library
                SET use_count = use_count + 1, last_used = :now
                WHERE id = :id
                """
            ),
            {"id": query_id, "now": now},
        )
        conn.commit()
        row = conn.execute(
            text("SELECT * FROM query_library WHERE id = :id"),
            {"id": query_id},
        ).fetchone()

    if not row:
        raise HTTPException(status_code=404, detail="Saved query not found.")

    return SavedQuery(**dict(row._mapping))
