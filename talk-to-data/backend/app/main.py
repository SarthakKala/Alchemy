"""FastAPI entry: CORS, routes, demo dataset on startup."""

# On Windows, pydantic/sqlalchemy/httpx can each take 30-90s on first cold load.
# We keep top-level imports minimal so uvicorn binds + prints its startup line fast.
# Routes and heavy deps are imported inside `lifespan` before the first request.
import asyncio
import sys
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

DEFAULT_SESSION_ID = "natwest-demo"


def _load_routes(app: FastAPI) -> None:
    """Import route modules and register them. Called once during lifespan."""
    print("talk-to-data: importing routes (sqlalchemy, httpx, pydantic)…", file=sys.stderr, flush=True)
    from app.api.routes import metrics, query, upload  # noqa: PLC0415

    app.include_router(upload.router, prefix="/api/upload", tags=["Upload"])
    app.include_router(query.router, prefix="/api/query", tags=["Query"])
    app.include_router(metrics.router, prefix="/api/metrics", tags=["Metrics"])
    print("talk-to-data: routes registered.", file=sys.stderr, flush=True)


def _load_default_dataset() -> None:
    """Load NatWest demo CSV so judges see data without uploading."""
    from app.core.config import DEFAULT_DEMO_CSV
    from app.core.database import create_session
    from app.utils.csv_parser import ingest_csv

    if not DEFAULT_DEMO_CSV.exists():
        return
    print("talk-to-data: loading demo dataset…", file=sys.stderr, flush=True)
    engine = create_session(DEFAULT_SESSION_ID)
    with open(DEFAULT_DEMO_CSV, "rb") as f:
        contents = f.read()
    ingest_csv(contents, "natwest_branch_performance_2024.csv", engine, DEFAULT_SESSION_ID)
    print("talk-to-data: demo dataset ready.", file=sys.stderr, flush=True)


@asynccontextmanager
async def lifespan(_app: FastAPI):
    # Import routes + heavy deps in a thread so ASGI loop isn't blocked.
    await asyncio.to_thread(_load_routes, _app)
    await asyncio.to_thread(_load_default_dataset)
    yield


# Read CORS origins without importing the full settings stack at module level.
import os  # noqa: E402
_cors_raw = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000")
_cors_origins = [o.strip() for o in _cors_raw.split(",") if o.strip()]

app = FastAPI(
    title="Talk to Data API",
    description="NL-to-SQL intelligence layer for self-service data analysis",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "talk-to-data"}
