"""Per-session SQLAlchemy engines (PostgreSQL or SQLite)."""

import re
import threading
from typing import Dict

from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine

from app.core.config import settings

_engines: Dict[str, Engine] = {}
_lock = threading.Lock()


def _make_engine() -> Engine:
    url = settings.DATABASE_URL
    connect_args: dict = {}
    if url.startswith("sqlite"):
        connect_args = {"check_same_thread": False}
    elif "postgresql" in url or url.startswith("postgres"):
        # Avoid hanging forever on unreachable Supabase/network during startup.
        connect_args = {"connect_timeout": 15}
    return create_engine(url, connect_args=connect_args, pool_pre_ping=True)


def session_table_name(session_id: str) -> str:
    """Stable table name for a session_id (matches csv_parser.sanitize_table_name)."""
    return "session_" + re.sub(r"[^a-z0-9]", "_", session_id.lower())


def create_session(session_id: str) -> Engine:
    """Create and register an engine for this session."""
    engine = _make_engine()
    with _lock:
        _engines[session_id] = engine
    return engine


def get_session(session_id: str) -> Engine | None:
    """Return the engine for session_id if registered."""
    return _engines.get(session_id)


def delete_session(session_id: str) -> None:
    """Drop the session table and dispose the engine."""
    engine = _engines.get(session_id)
    if not engine:
        return
    table_name = session_table_name(session_id)
    try:
        with engine.connect() as conn:
            conn.execute(text(f'DROP TABLE IF EXISTS "{table_name}"'))
            conn.commit()
    except Exception:
        pass
    with _lock:
        engine.dispose()
        del _engines[session_id]


def list_sessions() -> list[str]:
    return list(_engines.keys())
