"""Semantic layer (metrics.json) CRUD."""

from typing import Any, Dict

from fastapi import APIRouter

from app.core.metrics_store import load_metrics, save_metrics

router = APIRouter()


@router.get("/")
def get_metrics() -> Dict[str, Any]:
    return load_metrics()


@router.put("/")
def update_metrics(updated_metrics: Dict[str, Any]) -> Dict[str, Any]:
    save_metrics(updated_metrics)
    return {"status": "saved", "metrics": updated_metrics}
