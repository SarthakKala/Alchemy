# Alchemy

> Ask your data anything. No SQL. No analyst. Just answers.

**Alchemy** helps you explore a spreadsheet by asking questions in normal English—like “What sold best last quarter?”—instead of wrestling with formulas or technical tools yourself. You get answers with charts and numbers, plus a simple view of **how** those answers were pulled from **your** file. No SQL or analytics background is needed to understand what the product does; skip ahead to **Technologies** and **Running the Project** if you want to build or run it locally.

### What it is (technical overview)

Alchemy is a natural-language interface for tabular data. Upload any CSV, describe what you want in plain English, and get sourced answers with charts plus a transparent trail of how the answer was produced. A LangGraph orchestration layer runs **before** the model ever writes SQL: query coherence checks, intent and ambiguity handling, semantic enrichment against your own metric definitions, then generation, validation, execution, formatting, and signal-based confidence scoring.

The app lives under **`talk-to-data/`** — a FastAPI backend and a Next.js frontend — with PostgreSQL (Supabase) for persistence and OpenRouter for the LLM.

## 🛠️ Technologies

- Next.js (App Router), React, TypeScript, Tailwind CSS
- Three.js / postprocessing (visual layer on the landing experience)
- Recharts (dynamic charts from query results)
- Python, FastAPI, LangGraph, LangChain
- PostgreSQL (Supabase)
- OpenRouter (configurable models, e.g. Gemma via `LLM_MODEL`)

## ✨ Features

- **Coherence gate** — filters incoherent or unsafe natural-language queries before expensive SQL generation
- **Intent + ambiguity resolution** — classifies intent, pauses for clarification when the question is genuinely underspecified
- **Semantic layer** — define what columns and business metrics mean; the pipeline enriches the LLM context consistently
- **NL → SQL → validate → execute** — generated SQL is checked before it runs against your uploaded data
- **Show my work** — SQL, columns used, and row context surfaced in the UI for every answer
- **Signal-based confidence** — reflects how well the system understood the question, not only row counts
- **Query library** — save, name, and replay queries across sessions
- **Smart time language** — phrases like “this month” resolve against server date context
- **Charts** — bar, line, pie, or stat-style summaries chosen from query intent

## 🧠 Why This Exists

Most “text-to-SQL” demos stop at a single prompt. Real analysts need trust: they need to see the query, know when the model is guessing, and stop bad questions before they hit the database. Alchemy is built around that loop — coherence and validation as first-class stages, not afterthoughts.

## 🔧 Process

The backend is structured as a **LangGraph** pipeline with explicit routing: early exit when a query fails coherence or stays ambiguous after clarification, conditional paths when semantics or SQL generation errors, then execution and answer formatting with a dedicated confidence node.

The frontend is a chat-first workspace: upload flow, editable semantic definitions, answer cards with expandable provenance, and a library for queries you want to reuse. The API client targets a configurable base URL (`NEXT_PUBLIC_BACKEND_URL`) so local dev and deployed backends stay interchangeable.

Dataset uploads are bounded (see `MAX_UPLOAD_SIZE_MB` in backend config); the stack assumes PostgreSQL-compatible connections for Supabase.

## 📚 What I Learned

- **LangGraph state machines** — composing nodes with conditional edges for ambiguity, invalid SQL, and coherence failures instead of one giant imperative script
- **Making LLM outputs safe** — validating SQL before execution and surfacing errors back into the UX without silent failures
- **Semantic layers for one-off CSVs** — lightweight column/metric hints that reduce hallucinated joins and inconsistent definitions across sessions
- **Full-stack DX** — FastAPI + Next.js with clear env separation (`DATABASE_URL`, `OPENROUTER_*`, `NEXT_PUBLIC_BACKEND_URL`)
- **Product framing** — confidence and “show my work” as trust features, not optional debug panels

## 🌱 Overall Growth

Alchemy tightened my intuition for **orchestrated AI systems**: the hardest part is not prompting an LLM once, but routing failures, retries, and human-readable explanations through every branch. Shipping coherence and validation as explicit pipeline stages changed how I think about reliability in NL interfaces.

## 🚀 Running the Project

```bash
git clone https://github.com/SarthakKala/NatWest_Hack.git
cd NatWest_Hack/talk-to-data

# Backend
cd backend
python -m venv venv
# Windows: venv\Scripts\activate
# macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Set OPENROUTER_API_KEY, DATABASE_URL (Supabase Postgres URI), tweak LLM_MODEL if needed
uvicorn app.main:app --reload --port 8000

# Frontend (new terminal)
cd ../frontend
npm install
# Optional: echo NEXT_PUBLIC_BACKEND_URL=http://localhost:8000 > .env.local
npm run dev
```

Open **http://localhost:3000** once both processes are running. Confirm the API at **http://localhost:8000/health** if the UI cannot reach the backend.

## Limitations

- Complex multi-table joins remain difficult for generated SQL; results should always be sanity-checked.
- Semantic hints use structured text, not embeddings — nuance depends on how clearly you describe metrics.
- LLM rate limits on free tiers may require retries or model changes.
- Upload size is capped by configuration (default **50MB**).
