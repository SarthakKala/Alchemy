"""Load/save semantic layer (metrics.json)."""

import json
from pathlib import Path
from typing import Any, Dict, List

from app.core.config import DATA_DIR

METRICS_PATH: Path = DATA_DIR / "metrics.json"


def load_metrics() -> Dict[str, Any]:
    if not METRICS_PATH.exists():
        return {}
    with open(METRICS_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def save_metrics(metrics: Dict[str, Any]) -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    with open(METRICS_PATH, "w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2)


def enrich_schema_with_metrics(columns: List[str]) -> Dict[str, str]:
    """
    Map column names to human-readable definitions from the semantic layer.
    Returns { column_name: definition string }.
    """
    metrics = load_metrics()
    enriched: Dict[str, str] = {}

    for col in columns:
        for _metric_key, metric_data in metrics.items():
            aliases = metric_data.get("maps_to", [])
            if col in aliases or col == _metric_key:
                unit = metric_data.get("unit", "unknown")
                enriched[col] = f"{metric_data['definition']} (unit: {unit})"
                break

    return enriched
