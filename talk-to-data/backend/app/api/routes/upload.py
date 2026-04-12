"""CSV upload."""

import io
import uuid

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.core.database import create_session
from app.utils.schema_detector import detect_schema, generate_starter_questions

router = APIRouter()


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
