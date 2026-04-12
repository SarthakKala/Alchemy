# Talk to Data — Seamless Self-Service Intelligence

> NatWest Group — Code for Purpose India Hackathon

## Overview

Talk to Data is an AI-powered self-service intelligence layer for analytics-style CSVs. Business users ask plain-English questions about **uploaded** CSV data and receive answers with optional charts, confidence indicators, and full SQL transparency. Intended users are analysts and business stakeholders who need fast, auditable insights without writing SQL.

## Workflow

Upload a CSV on the home screen, then ask questions in natural language. Starter questions are generated from the detected schema.

## Features

- Natural language querying over uploaded CSVs (stored per session in PostgreSQL or local SQLite)
- LangGraph pipeline: intent classification, ambiguity handling, semantic enrichment, SQL generation, validation (`EXPLAIN`), execution, answer formatting, confidence scoring
- Editable semantic layer (`backend/data/metrics.json`) with GET/PUT `/api/metrics/`
- "How was this calculated?" drawer showing generated SQL, columns, and row count
- Confidence badge (high / medium / low) with short reasons
- Auto starter questions after each upload
- Dynamic charts (bar, line, pie, stat) via Recharts
- Rate-limit aware API client (429) on the frontend

## Install and Run

### Backend

```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux: source venv/bin/activate

pip install -r requirements.txt
copy .env.example .env
# Set OPENROUTER_API_KEY and optionally DATABASE_URL (PostgreSQL). Defaults use SQLite ./fallback.db.

uvicorn app.main:app --reload --port 8000
```

Health check: `http://localhost:8000/health`

### Frontend

```bash
cd frontend
npm install
copy .env.local.example .env.local
npm run dev
```

Open `http://localhost:3000`. Ensure `NEXT_PUBLIC_BACKEND_URL` matches the API (default `http://localhost:8000`).

### Tests (backend)

```bash
cd backend
pytest tests -v
```

## Tech Stack

- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS, Recharts, Axios, Lucide icons
- **Backend:** Python, FastAPI, LangGraph, LangChain, OpenRouter (OpenAI-compatible API)
- **Database:** SQLAlchemy; SQLite for local dev, PostgreSQL (e.g. Supabase) in production
- **AI:** OpenRouter → configurable model (default Llama 3.3 70B instruct)

## Usage Examples

**Upload CSV** (returns `session_id` and `table_name` — use those in the query below):

```http
POST http://localhost:8000/api/upload/
Content-Type: multipart/form-data

file=@your.csv
```

**Query:**

```http
POST http://localhost:8000/api/query/
Content-Type: application/json

{
  "session_id": "<from upload response>",
  "table_name": "<from upload response>",
  "user_query": "What is total revenue by region?"
}
```

### Clear uploaded tables in Supabase (PostgreSQL)

Uploads create tables named `session_*`. To remove them all from your Supabase project, open **SQL Editor** and run `docs/clear_supabase_session_tables.sql` (review first if you have unrelated tables with the same prefix).

### Clear local SQLite cache

If you use the default `DATABASE_URL` pointing at `./fallback.db`, delete `backend/fallback.db` while the backend is stopped to wipe local session data.

## Architecture

Flow: **Next.js** → **FastAPI** (`/api/upload`, `/api/query`, `/api/metrics`) → **LangGraph** (intent → ambiguity → semantics → SQL → validate → execute → format → confidence) → **SQLAlchemy** (SQLite/Postgres). LLM calls go to **OpenRouter**.

Add a diagram under `docs/architecture.png` if required for submission.

## Limitations

- Requires a valid `OPENROUTER_API_KEY` for SQL generation and answer formatting; without it, the API returns a clear configuration error.
- Complex multi-table joins are not in scope (single uploaded table per session).
- CSV upload limit is 50MB (enforced on the upload route).
- OpenRouter free tier may rate-limit; the API returns HTTP 429 with retry guidance.

## Future Improvements

- Embedding-based semantic matching for column synonyms
- Excel (.xlsx) ingestion
- PDF export of answers
- Auth and team-scoped metric dictionaries
