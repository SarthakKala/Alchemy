"""Normalize DB/driver values for JSON and LLM prompts."""

from datetime import date, datetime, time
from decimal import Decimal
from typing import Any


def json_safe_value(v: Any) -> Any:
    if v is None:
        return None
    if isinstance(v, Decimal):
        return float(v)
    if isinstance(v, (datetime, date, time)):
        return v.isoformat()
    if isinstance(v, bytes):
        return v.decode("utf-8", errors="replace")
    return v


def json_safe_row(row: dict[str, Any]) -> dict[str, Any]:
    return {k: json_safe_value(v) for k, v in row.items()}
