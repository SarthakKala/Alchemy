"""CSV upload and default NatWest demo session."""

import io
import uuid

from fastapi import APIRouter, File, HTTPException, UploadFile
from sqlalchemy import text

from app.core.config import DEFAULT_DEMO_CSV
from app.core.database import create_session, get_session, session_table_name
from app.utils.schema_detector import detect_schema, generate_starter_questions

router = APIRouter()

DEFAULT_SESSION_ID = "natwest-demo"


def _columns_from_engine(engine, table_name: str, filename: str):
    """Build column metadata similar to ingest_csv output."""
    import pandas as pd
    from sqlalchemy import inspect as sa_inspect

    insp = sa_inspect(engine)
    cols = insp.get_columns(table_name)
    with engine.connect() as conn:
        result = conn.execute(text(f'SELECT * FROM "{table_name}" LIMIT 100'))
        keys = list(result.keys())
        rows = result.fetchall()
        row_dicts = [dict(zip(keys, row)) for row in rows]
        df = pd.DataFrame(row_dicts) if row_dicts else None

    out = []
    for c in cols:
        name = c["name"]
        if df is not None and name in df.columns:
            sample = df[name].dropna().head(3).tolist()
            null_count = int(df[name].isnull().sum())
        else:
            sample = []
            null_count = 0
        out.append(
            {
                "name": name,
                "type": str(c["type"]),
                "sample": sample,
                "null_count": null_count,
            }
        )
    row_count = 0
    with engine.connect() as conn:
        row_count = conn.execute(
            text(f'SELECT COUNT(*) FROM "{table_name}"')
        ).scalar() or 0

    return {
        "columns": out,
        "row_count": row_count,
        "filename": filename,
        "table_name": table_name,
    }


@router.post("/")
async def upload_csv(file: UploadFile = File(...)):
    """Upload CSV; create session and ingest into DB."""
    if not file.filename or not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported.")

    contents = await file.read()
    max_bytes = 50 * 1024 * 1024
    if len(contents) > max_bytes:
        raise HTTPException(status_code=413, detail="File exceeds 50MB limit.")

    session_id = str(uuid.uuid4())
    engine = create_session(session_id)

    try:
        from app.utils.csv_parser import ingest_csv

        schema_meta = ingest_csv(contents, file.filename, engine, session_id)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Failed to parse CSV: {str(e)}") from e

    schema_info = detect_schema(engine, schema_meta["table_name"])
    starter_questions = generate_starter_questions(
        schema_info, schema_meta["table_name"]
    )

    return {
        "session_id": session_id,
        "table_name": schema_meta["table_name"],
        "filename": schema_meta["filename"],
        "row_count": schema_meta["row_count"],
        "columns": schema_meta["columns"],
        "schema_info": schema_info,
        "starter_questions": starter_questions,
    }


@router.get("/default-session")
def get_default_session():
    """Pre-loaded demo session for judges (skip upload UI when available)."""
    engine = get_session(DEFAULT_SESSION_ID)
    if not engine:
        return {"available": False}

    table_name = session_table_name(DEFAULT_SESSION_ID)
    schema_info = detect_schema(engine, table_name)
    starters = generate_starter_questions(schema_info, table_name)

    meta = _columns_from_engine(engine, table_name, "natwest_branch_performance_2024.csv")

    return {
        "available": True,
        "session_id": DEFAULT_SESSION_ID,
        "table_name": table_name,
        "filename": meta["filename"],
        "row_count": meta["row_count"],
        "columns": meta["columns"],
        "schema_info": schema_info,
        "starter_questions": starters,
    }


@router.post("/reload-demo")
def reload_demo_dataset():
    """Dev helper: re-ingest demo CSV from disk."""
    if not DEFAULT_DEMO_CSV.exists():
        raise HTTPException(status_code=404, detail="Demo CSV not found.")
    engine = create_session(DEFAULT_SESSION_ID)
    with open(DEFAULT_DEMO_CSV, "rb") as f:
        contents = f.read()
    from app.utils.csv_parser import ingest_csv

    ingest_csv(contents, "natwest_branch_performance_2024.csv", engine, DEFAULT_SESSION_ID)
    return {"status": "ok"}
