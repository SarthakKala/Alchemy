# Talk to Data — Seamless Self-Service Intelligence

> NatWest Group — Code for Purpose India Hackathon

## Overview

Talk to Data is an AI-powered self-service intelligence layer built for NatWest-style branch and product analytics. Business users ask plain-English questions about uploaded CSV data (or a pre-loaded demo dataset) and receive answers with optional charts, confidence indicators, and full SQL transparency. Intended users are analysts and business stakeholders who need fast, auditable insights without writing SQL.

## Demo

The app loads a pre-built **NatWest branch performance** CSV (`backend/data/natwest_branch_performance_2024.csv`) into session `natwest-demo` on backend startup. With the backend running, the frontend skips the upload screen when `GET /api/upload/default-session` reports `available: true`.

Try asking:

- "Why did revenue drop in the South West region in March 2024?"
- "Compare North vs London revenue across all months"
- "Show the breakdown of complaints by region"

## Features

- Natural language querying over uploaded CSVs (stored per session in PostgreSQL or local SQLite)
- LangGraph pipeline: intent classification, ambiguity handling, semantic enrichment, SQL generation, validation (`EXPLAIN`), execution, answer formatting, confidence scoring
- Editable semantic layer (`backend/data/metrics.json`) with GET/PUT `/api/metrics/`
- "How was this calculated?" drawer showing generated SQL, columns, and row count
- Confidence badge (high / medium / low) with short reasons
- Auto starter questions after upload or when loading the demo session
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

**Default session (after backend start):**

```http
GET http://localhost:8000/api/upload/default-session
```

**Upload CSV:**

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
  "session_id": "natwest-demo",
  "table_name": "session_natwest_demo",
  "user_query": "What is total revenue_gbp by region?"
}
```

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
