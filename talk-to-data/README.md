# Alchemy

> Ask your data anything. No SQL. No analyst. Just answers.

## What It Is

Alchemy is a personal data intelligence tool. Upload any CSV and ask plain-English
questions - it returns instant, sourced, auditable answers with charts and full
transparency into how each insight was derived.

Built with a LangGraph 7-node pipeline, a semantic layer for consistent metric
definitions, and a personal Query Library to save and replay your best queries.

## Demo

1. Clone the repo
2. Add your OpenRouter API key and Supabase DATABASE_URL to `.env`
3. Run backend + frontend (see Install below)
4. Upload any CSV and start asking

## Features

- Natural language querying over any CSV
- 7-node LangGraph pipeline: intent classification, smart time resolution, semantic enrichment, SQL generation, validation, execution, answer formatting
- Signal-based confidence scoring - scores how well the system understood your query, not just how many rows came back
- "Show My Work" drawer - full SQL, columns used, row count on every answer
- Editable semantic layer - define what your column names mean
- **Query Library** - save, name, and replay queries across sessions
- Auto time resolution - "this month", "last quarter" resolve from server date
- Dynamic chart selection (bar, line, pie, stat) based on query intent

## Install

### Backend
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # Add OPENROUTER_API_KEY and DATABASE_URL
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

Open http://localhost:3000

## Stack

- **Frontend:** Next.js 14, TypeScript, Tailwind CSS, Recharts, Syne + DM Sans fonts
- **Backend:** Python, FastAPI, LangGraph, LangChain
- **Database:** PostgreSQL on Supabase
- **LLM:** OpenRouter -> Llama 3.3 70B (free tier)
- **Deployment:** Vercel + Render

## Limitations

- LLM SQL generation can fail on complex multi-join queries
- Semantic layer uses string matching, not embeddings
- Free-tier LLM has rate limits - handled gracefully with retry prompts
- Dataset size capped at 50MB
