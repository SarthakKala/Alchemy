# 🔥 Alchemy — Personal Project Conversion Guide
## From NatWest Hackathon Tool → Your Own Product

> This file is your complete guide to converting Talk to Data into **Alchemy** — a personal, portfolio-grade, general-purpose data intelligence tool. Follow every step in order.

---

## 📌 What Changes and Why

| Before | After |
|--------|-------|
| "Talk to Data" — NatWest branded | **Alchemy** — your personal product |
| Dark grey (#050505) + green (#3ECF8E) | Warm dark + orange gradient theme |
| NatWest demo dataset pre-loaded | General CSV upload, no hardcoded dataset |
| No user persistence | **Query Library** — save & replay queries |
| Hackathon README | Personal portfolio README |

---

## 🎨 THEME — Design System

The entire app uses warm dark + orange. Not pure black. Think embers, not void.

### CSS Variables — `frontend/src/app/globals.css`

Replace the entire globals.css with this:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

:root {
  /* Background layers — warm dark, not pure black */
  --bg-base:        #0C0A08;
  --bg-surface:     #151210;
  --bg-elevated:    #1E1A16;
  --bg-overlay:     #26211C;

  /* Borders */
  --border-subtle:  #2A2420;
  --border-default: #352E28;
  --border-strong:  #453C34;

  /* Orange gradient palette — matches the image */
  --orange-dim:     #8C3D10;
  --orange-base:    #C25A18;
  --orange-mid:     #D4691E;
  --orange-bright:  #E8832A;
  --orange-glow:    #F0A050;
  --orange-pale:    #F5C08A;

  /* Gradient definitions */
  --gradient-btn:      linear-gradient(135deg, #C25A18 0%, #E0782A 50%, #D4691E 100%);
  --gradient-btn-hover:linear-gradient(135deg, #D4691E 0%, #F0892E 50%, #E07820 100%);
  --gradient-accent:   linear-gradient(135deg, #8C3D10 0%, #C25A18 100%);
  --gradient-glow:     radial-gradient(ellipse at center, #C25A1840 0%, transparent 70%);
  --gradient-card:     linear-gradient(145deg, #1E1A16 0%, #151210 100%);

  /* Text */
  --text-primary:   #F5F0EB;
  --text-secondary: #9A8E84;
  --text-muted:     #5C5248;
  --text-orange:    #E8832A;

  /* Confidence colours */
  --confidence-high:   #4ADE80;
  --confidence-medium: #FBBF24;
  --confidence-low:    #F87171;

  /* Fonts */
  --font-display: 'Syne', sans-serif;
  --font-body:    'DM Sans', sans-serif;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  background-color: var(--bg-base);
  color: var(--text-primary);
  font-family: var(--font-body);
  -webkit-font-smoothing: antialiased;
}

body {
  background-color: var(--bg-base);
  /* Subtle warm noise texture overlay */
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
}

/* Scrollbar */
::-webkit-scrollbar       { width: 4px; }
::-webkit-scrollbar-track { background: var(--bg-base); }
::-webkit-scrollbar-thumb { background: var(--border-strong); border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: var(--orange-base); }

/* Orange glow utility */
.glow-orange {
  box-shadow: 0 0 24px #C25A1830, 0 0 8px #C25A1820;
}

.glow-orange-strong {
  box-shadow: 0 0 40px #C25A1850, 0 0 16px #C25A1835;
}

/* Gradient text */
.text-gradient-orange {
  background: linear-gradient(135deg, #E8832A, #F5C08A);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Animated gradient button */
.btn-orange {
  background: var(--gradient-btn);
  color: #fff;
  font-family: var(--font-body);
  font-weight: 500;
  letter-spacing: 0.01em;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.btn-orange::after {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--gradient-btn-hover);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.btn-orange:hover::after { opacity: 1; }
.btn-orange:hover { transform: translateY(-1px); box-shadow: 0 8px 24px #C25A1840; }
.btn-orange:active { transform: translateY(0); }

/* Card surface */
.card {
  background: var(--gradient-card);
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
}
```

---

### Tailwind Config — `frontend/tailwind.config.ts`

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          base:     '#0C0A08',
          surface:  '#151210',
          elevated: '#1E1A16',
          overlay:  '#26211C',
        },
        border: {
          subtle:  '#2A2420',
          default: '#352E28',
          strong:  '#453C34',
        },
        orange: {
          dim:    '#8C3D10',
          base:   '#C25A18',
          mid:    '#D4691E',
          bright: '#E8832A',
          glow:   '#F0A050',
          pale:   '#F5C08A',
        },
        text: {
          primary:   '#F5F0EB',
          secondary: '#9A8E84',
          muted:     '#5C5248',
        }
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body:    ['DM Sans', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-btn':    'linear-gradient(135deg, #C25A18 0%, #E0782A 50%, #D4691E 100%)',
        'gradient-accent': 'linear-gradient(135deg, #8C3D10 0%, #C25A18 100%)',
        'gradient-card':   'linear-gradient(145deg, #1E1A16 0%, #151210 100%)',
      },
      animation: {
        'pulse-orange': 'pulseOrange 2s ease-in-out infinite',
        'slide-up':     'slideUp 0.3s ease-out',
        'fade-in':      'fadeIn 0.4s ease-out',
      },
      keyframes: {
        pulseOrange: {
          '0%, 100%': { boxShadow: '0 0 8px #C25A1830' },
          '50%':      { boxShadow: '0 0 24px #C25A1860' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

export default config
```

---

## 🏷️ BRANDING — New Name, New Identity

### The Name: **Alchemy**

Raw data → golden insight. The orange/gold theme isn't random — it's the metaphor. You turn CSV lead into intelligence gold.

Tagline: *"Ask your data anything."*

Sub-tagline: *"No SQL. No analysts. Just answers."*

---

## 🗄️ PHASE 0 — Remove NatWest Specifics

### Step 0.1 — Delete the demo dataset pre-load from `main.py`

Remove the entire `@app.on_event("startup")` block and the `DEFAULT_DATASET_PATH` / `DEFAULT_SESSION_ID` constants. Alchemy works with any CSV the user uploads — there's no pre-loaded dataset.

Also remove from `upload.py`: the entire `GET /api/upload/default-session` route.

And from `page.tsx`: remove the `useEffect` that calls `getDefaultSession()` and the `checkingDemo` state. Replace with a clean upload-first landing.

### Step 0.2 — Update `backend/data/metrics.json`

Replace the NatWest-specific semantic layer with a general-purpose one that works across any business CSV:

```json
{
  "revenue": {
    "definition": "Total income or sales amount generated",
    "maps_to": ["revenue", "rev", "income", "sales", "sales_amount", "total_sales",
                "gross_revenue", "net_revenue", "revenue_gbp", "revenue_usd",
                "amount", "value", "total_amount"],
    "unit": "currency"
  },
  "cost": {
    "definition": "Total expenditure or operational cost",
    "maps_to": ["cost", "costs", "expense", "expenses", "expenditure",
                "cost_gbp", "cost_usd", "operational_cost", "spend"],
    "unit": "currency"
  },
  "profit": {
    "definition": "Net earnings after subtracting costs from revenue",
    "maps_to": ["profit", "net_profit", "margin", "earnings", "net_income"],
    "unit": "currency"
  },
  "users": {
    "definition": "Total number of users or customers",
    "maps_to": ["users", "customers", "clients", "accounts", "members",
                "new_customers", "active_users", "total_users"],
    "unit": "count"
  },
  "churn": {
    "definition": "Rate at which users or customers stop engaging",
    "maps_to": ["churn", "churn_rate", "attrition", "dropout_rate"],
    "unit": "percentage"
  },
  "orders": {
    "definition": "Total number of completed transactions or orders",
    "maps_to": ["orders", "total_orders", "num_orders", "order_count",
                "transactions", "purchases"],
    "unit": "count"
  },
  "complaints": {
    "definition": "Number of complaints, issues, or negative feedback items received",
    "maps_to": ["complaints", "complaint_count", "issues", "tickets",
                "negative_feedback", "disputes"],
    "unit": "count"
  },
  "score": {
    "definition": "A performance, satisfaction, or quality score metric",
    "maps_to": ["score", "nps_score", "rating", "satisfaction", "performance_score",
                "quality_score", "net_score"],
    "unit": "score"
  },
  "quantity": {
    "definition": "Count or volume of items, units, or products",
    "maps_to": ["quantity", "qty", "volume", "units", "count", "total_count"],
    "unit": "count"
  },
  "rate": {
    "definition": "A ratio or percentage metric such as conversion, error, or growth rate",
    "maps_to": ["rate", "conversion_rate", "growth_rate", "error_rate",
                "success_rate", "default_rate", "loan_default_rate"],
    "unit": "percentage"
  }
}
```

---

## ✨ NEW FEATURE — Query Library

This is what makes Alchemy a personal product, not a demo. Save any query you run, give it a name, replay it later against the same or a new dataset.

### Step 1 — Backend: New Route

**`backend/app/api/routes/library.py`**

```python
# Query Library — save, list, replay named queries
# Stored in Supabase table: query_library
# Each saved query has: id, name, query_text, intent, last_used, use_count

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import uuid
from sqlalchemy import text
from app.core.database import get_session

router = APIRouter()

def _ensure_library_table(engine):
    """Create query_library table if it doesn't exist."""
    with engine.connect() as conn:
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS query_library (
                id          TEXT PRIMARY KEY,
                name        TEXT NOT NULL,
                query_text  TEXT NOT NULL,
                intent      TEXT,
                use_count   INTEGER DEFAULT 1,
                created_at  TEXT NOT NULL,
                last_used   TEXT NOT NULL
            )
        """))
        conn.commit()

class SaveQueryRequest(BaseModel):
    session_id: str
    name: str
    query_text: str
    intent: Optional[str] = None

class SavedQuery(BaseModel):
    id: str
    name: str
    query_text: str
    intent: Optional[str]
    use_count: int
    created_at: str
    last_used: str

@router.post("/", response_model=SavedQuery)
def save_query(req: SaveQueryRequest):
    """Save a query to the personal library."""
    engine = get_session(req.session_id)
    if not engine:
        raise HTTPException(status_code=404, detail="Session not found.")
    _ensure_library_table(engine)
    now = datetime.utcnow().isoformat()
    entry_id = str(uuid.uuid4())
    with engine.connect() as conn:
        conn.execute(text("""
            INSERT INTO query_library (id, name, query_text, intent, use_count, created_at, last_used)
            VALUES (:id, :name, :query_text, :intent, 1, :created_at, :last_used)
        """), {"id": entry_id, "name": req.name, "query_text": req.query_text,
               "intent": req.intent, "created_at": now, "last_used": now})
        conn.commit()
    return SavedQuery(id=entry_id, name=req.name, query_text=req.query_text,
                      intent=req.intent, use_count=1, created_at=now, last_used=now)

@router.get("/", response_model=List[SavedQuery])
def get_library(session_id: str):
    """Get all saved queries, most recently used first."""
    engine = get_session(session_id)
    if not engine:
        raise HTTPException(status_code=404, detail="Session not found.")
    _ensure_library_table(engine)
    with engine.connect() as conn:
        rows = conn.execute(
            text("SELECT * FROM query_library ORDER BY last_used DESC")
        ).fetchall()
    return [SavedQuery(**dict(r._mapping)) for r in rows]

@router.delete("/{query_id}")
def delete_saved_query(query_id: str, session_id: str):
    """Delete a saved query by ID."""
    engine = get_session(session_id)
    if not engine:
        raise HTTPException(status_code=404, detail="Session not found.")
    with engine.connect() as conn:
        conn.execute(text("DELETE FROM query_library WHERE id = :id"), {"id": query_id})
        conn.commit()
    return {"deleted": query_id}

@router.post("/{query_id}/replay")
def replay_query(query_id: str, session_id: str):
    """
    Mark a saved query as replayed (increments use_count, updates last_used).
    Frontend calls this when user clicks a saved query to run it again.
    Returns the query_text so the frontend can submit it to /api/query/.
    """
    engine = get_session(session_id)
    if not engine:
        raise HTTPException(status_code=404, detail="Session not found.")
    now = datetime.utcnow().isoformat()
    with engine.connect() as conn:
        conn.execute(text("""
            UPDATE query_library
            SET use_count = use_count + 1, last_used = :now
            WHERE id = :id
        """), {"id": query_id, "now": now})
        conn.commit()
        row = conn.execute(
            text("SELECT * FROM query_library WHERE id = :id"), {"id": query_id}
        ).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Saved query not found.")
    return SavedQuery(**dict(row._mapping))
```

Register it in `main.py`:

```python
from app.api.routes import upload, query, metrics, library

app.include_router(library.router, prefix="/api/library", tags=["Library"])
```

---

### Step 2 — Frontend: Types

Add to **`frontend/src/lib/types.ts`**:

```typescript
export interface SavedQuery {
  id: string;
  name: string;
  query_text: string;
  intent?: string;
  use_count: number;
  created_at: string;
  last_used: string;
}
```

---

### Step 3 — Frontend: API calls

Add to **`frontend/src/lib/api.ts`**:

```typescript
import { SavedQuery } from './types';

export async function saveQuery(
  sessionId: string,
  name: string,
  queryText: string,
  intent?: string
): Promise<SavedQuery> {
  const { data } = await api.post<SavedQuery>('/api/library/', {
    session_id: sessionId,
    name,
    query_text: queryText,
    intent
  });
  return data;
}

export async function getLibrary(sessionId: string): Promise<SavedQuery[]> {
  const { data } = await api.get<SavedQuery[]>('/api/library/', {
    params: { session_id: sessionId }
  });
  return data;
}

export async function deleteSavedQuery(sessionId: string, queryId: string): Promise<void> {
  await api.delete(`/api/library/${queryId}`, { params: { session_id: sessionId } });
}

export async function replaySavedQuery(sessionId: string, queryId: string): Promise<SavedQuery> {
  const { data } = await api.post<SavedQuery>(`/api/library/${queryId}/replay`, null, {
    params: { session_id: sessionId }
  });
  return data;
}
```

---

### Step 4 — Frontend: QueryLibrary Component

**`frontend/src/components/library/QueryLibrary.tsx`**

```tsx
// Personal query library — save, browse, and replay your best queries
// Appears in the left sidebar, below query history

'use client';
import { useState, useEffect } from 'react';
import { SavedQuery } from '@/lib/types';
import { getLibrary, deleteSavedQuery, replaySavedQuery } from '@/lib/api';
import { BookmarkIcon, PlayIcon, TrashIcon } from 'lucide-react';

interface Props {
  sessionId: string;
  onReplay: (queryText: string) => void;
}

export function QueryLibrary({ sessionId, onReplay }: Props) {
  const [library, setLibrary]   = useState<SavedQuery[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    getLibrary(sessionId)
      .then(setLibrary)
      .finally(() => setLoading(false));
  }, [sessionId]);

  const handleReplay = async (item: SavedQuery) => {
    await replaySavedQuery(sessionId, item.id);
    setLibrary(prev =>
      prev.map(q => q.id === item.id
        ? { ...q, use_count: q.use_count + 1, last_used: new Date().toISOString() }
        : q
      )
    );
    onReplay(item.query_text);
  };

  const handleDelete = async (id: string) => {
    await deleteSavedQuery(sessionId, id);
    setLibrary(prev => prev.filter(q => q.id !== id));
  };

  const intentColor: Record<string, string> = {
    change:    'text-orange-bright border-orange-dim',
    compare:   'text-blue-400 border-blue-900',
    breakdown: 'text-purple-400 border-purple-900',
    summary:   'text-green-400 border-green-900',
  };

  return (
    <div className="mt-6">
      <div className="flex items-center gap-2 mb-3">
        <BookmarkIcon size={13} className="text-orange-mid" />
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '11px',
                     fontWeight: 600, letterSpacing: '0.08em',
                     color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
          Query Library
        </h3>
        {library.length > 0 && (
          <span className="ml-auto text-xs px-1.5 py-0.5 rounded-full"
                style={{ background: 'var(--bg-overlay)', color: 'var(--text-muted)' }}>
            {library.length}
          </span>
        )}
      </div>

      {loading && (
        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Loading...</p>
      )}

      {!loading && library.length === 0 && (
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
          Save queries you want to reuse. Click the bookmark icon on any answer.
        </p>
      )}

      <div className="space-y-1.5">
        {library.map(item => (
          <div
            key={item.id}
            className="group rounded-lg p-2.5 transition-all"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '12px',
                            fontWeight: 600, color: 'var(--text-primary)',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.name}
                </p>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.query_text}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  {item.intent && (
                    <span className={`text-xs px-1.5 py-0.5 rounded border ${intentColor[item.intent] || 'text-text-secondary border-border-subtle'}`}
                          style={{ fontSize: '10px' }}>
                      {item.intent}
                    </span>
                  )}
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                    ×{item.use_count}
                  </span>
                </div>
              </div>

              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <button
                  onClick={() => handleReplay(item)}
                  className="p-1 rounded hover:bg-orange-dim/30 transition-colors"
                  title="Replay this query"
                >
                  <PlayIcon size={11} className="text-orange-bright" />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1 rounded hover:bg-red-900/30 transition-colors"
                  title="Delete"
                >
                  <TrashIcon size={11} className="text-red-400" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

### Step 5 — Save Button on AnswerCard

In **`frontend/src/components/answer/AnswerCard.tsx`**, add a save button that appears on hover. When clicked, it prompts for a name and calls `saveQuery()`.

Add this to the AnswerCard props and JSX:

```tsx
import { BookmarkIcon } from 'lucide-react';
import { saveQuery } from '@/lib/api';

// Inside the component, after the answer text:
const [saved, setSaved] = useState(false);

const handleSave = async () => {
  const name = window.prompt('Name this query:', response.user_query.slice(0, 40));
  if (!name) return;
  await saveQuery(sessionId, name, response.user_query, response.intent);
  setSaved(true);
  setTimeout(() => setSaved(false), 2000);
};

// In JSX, near the confidence badge:
<button
  onClick={handleSave}
  className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-all"
  style={{
    background: saved ? 'var(--bg-overlay)' : 'transparent',
    color: saved ? 'var(--orange-bright)' : 'var(--text-muted)',
    border: `1px solid ${saved ? 'var(--orange-dim)' : 'var(--border-subtle)'}`
  }}
>
  <BookmarkIcon size={11} />
  {saved ? 'Saved' : 'Save'}
</button>
```

---

## 🖥️ PHASE 1 — Updated Landing Page

**`frontend/src/app/page.tsx`** — Full replacement:

```tsx
'use client';
import { useState } from 'react';
import { UploadZone }    from '@/components/upload/UploadZone';
import { SchemaPreview } from '@/components/upload/SchemaPreview';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { QueryHistory }  from '@/components/sidebar/QueryHistory';
import { QueryLibrary }  from '@/components/library/QueryLibrary';
import { MetricEditor }  from '@/components/semantic/MetricEditor';
import { UploadResponse, HistoryItem } from '@/lib/types';

export default function HomePage() {
  const [uploadData, setUploadData] = useState<UploadResponse | null>(null);
  const [history, setHistory]       = useState<HistoryItem[]>([]);
  const [replayQuery, setReplayQuery] = useState<string | undefined>();

  const handleUploadComplete = (data: UploadResponse) => {
    setUploadData(data);
    setHistory([]);
  };

  const addToHistory = (item: HistoryItem) => {
    setHistory(prev => [item, ...prev]);
  };

  // Landing screen
  if (!uploadData) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-8"
            style={{ background: 'var(--bg-base)' }}>

        {/* Logo mark */}
        <div className="mb-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center glow-orange"
               style={{ background: 'var(--gradient-btn)' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800,
                           fontSize: '18px', color: '#fff' }}>A</span>
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700,
                         fontSize: '22px', color: 'var(--text-primary)',
                         letterSpacing: '-0.02em' }}>
            Alchemy
          </span>
        </div>

        {/* Headline */}
        <div className="text-center mb-10 max-w-xl">
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800,
                       fontSize: 'clamp(32px, 5vw, 52px)', lineHeight: 1.1,
                       letterSpacing: '-0.03em', marginBottom: '16px' }}>
            Ask your data{' '}
            <span className="text-gradient-orange">anything.</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '16px',
                      lineHeight: 1.6, fontWeight: 300 }}>
            Upload any CSV. Ask questions in plain English.
            Get instant, sourced, auditable answers — no SQL, no analyst needed.
          </p>
        </div>

        {/* Upload zone */}
        <div className="w-full max-w-lg">
          <UploadZone onUploadComplete={handleUploadComplete} />
        </div>

        {/* Social proof */}
        <p style={{ marginTop: '32px', fontSize: '12px', color: 'var(--text-muted)',
                    letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          Works with any CSV · No account needed · Fully private
        </p>
      </main>
    );
  }

  // Main app
  return (
    <main className="min-h-screen flex" style={{ background: 'var(--bg-base)' }}>

      {/* Left sidebar */}
      <aside className="w-60 flex-shrink-0 flex flex-col p-4 overflow-y-auto"
             style={{ borderRight: '1px solid var(--border-subtle)' }}>

        {/* Logo */}
        <div className="flex items-center gap-2 mb-6">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
               style={{ background: 'var(--gradient-btn)' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800,
                           fontSize: '13px', color: '#fff' }}>A</span>
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700,
                         fontSize: '16px', color: 'var(--text-primary)' }}>
            Alchemy
          </span>
        </div>

        <QueryHistory history={history} />
        <QueryLibrary
          sessionId={uploadData.session_id}
          onReplay={(q) => setReplayQuery(q)}
        />
      </aside>

      {/* Main content */}
      <section className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center gap-3 px-5 py-3 flex-shrink-0"
             style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <div className="w-2 h-2 rounded-full animate-pulse-orange"
               style={{ background: 'var(--orange-bright)' }} />
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600,
                         fontSize: '13px', color: 'var(--text-primary)' }}>
            {uploadData.filename}
          </span>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)',
                         background: 'var(--bg-elevated)',
                         padding: '2px 8px', borderRadius: '20px',
                         border: '1px solid var(--border-subtle)' }}>
            {uploadData.row_count} rows
          </span>
          <button
            onClick={() => setUploadData(null)}
            className="ml-auto text-xs transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseOver={e => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseOut={e  => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            ↑ New file
          </button>
        </div>

        <ChatInterface
          uploadData={uploadData}
          onAddToHistory={addToHistory}
          initialQuery={replayQuery}
          onReplayConsumed={() => setReplayQuery(undefined)}
        />
      </section>

      {/* Right panel */}
      <aside className="w-68 flex-shrink-0 overflow-y-auto p-4"
             style={{ borderLeft: '1px solid var(--border-subtle)', width: '272px' }}>
        <SchemaPreview uploadData={uploadData} />
        <div className="mt-6">
          <MetricEditor />
        </div>
      </aside>
    </main>
  );
}
```

---

## 🔼 PHASE 2 — Updated Upload Zone

**`frontend/src/components/upload/UploadZone.tsx`** — Replace the colour values:

```tsx
// Key style changes only — keep all logic identical, just swap colours:

// Border idle:    border-color: var(--border-default)
// Border hover:   border-color: var(--orange-base)
// Border dragging:border-color: var(--orange-bright), background: #C25A1808
// Button class:   btn-orange (defined in globals.css)
// Loading text:   color: var(--orange-bright)
// Error text:     color: #F87171

// The drag zone div style:
style={{
  border: `2px dashed ${isDragging ? 'var(--orange-bright)' : 'var(--border-default)'}`,
  background: isDragging ? '#C25A1808' : 'transparent',
  borderRadius: '12px',
  padding: '48px 32px',
  textAlign: 'center',
  transition: 'all 0.2s ease',
  boxShadow: isDragging ? '0 0 24px #C25A1820' : 'none'
}}

// Main text:
style={{ color: 'var(--text-primary)', fontSize: '16px',
         fontFamily: 'var(--font-display)', fontWeight: 600, marginBottom: '8px' }}

// Sub text:
style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px' }}

// Browse button — use className="btn-orange" with px-5 py-2.5 rounded-xl text-sm
```

---

## 📋 PHASE 3 — Updated README

Replace your full `README.md` with this:

````markdown
# Alchemy

> Ask your data anything. No SQL. No analyst. Just answers.

## What It Is

Alchemy is a personal data intelligence tool. Upload any CSV and ask plain-English
questions — it returns instant, sourced, auditable answers with charts and full
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
- 7-node LangGraph pipeline: intent classification, smart time resolution,
  semantic enrichment, SQL generation, validation, execution, answer formatting
- Signal-based confidence scoring — scores how well the system understood
  your query, not just how many rows came back
- "Show My Work" drawer — full SQL, columns used, row count on every answer
- Editable semantic layer — define what your column names mean
- **Query Library** — save, name, and replay queries across sessions
- Auto time resolution — "this month", "last quarter" resolve from server date
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
- **LLM:** OpenRouter → Llama 3.3 70B (free tier)
- **Deployment:** Vercel + Render

## Limitations

- LLM SQL generation can fail on complex multi-join queries
- Semantic layer uses string matching, not embeddings
- Free-tier LLM has rate limits — handled gracefully with retry prompts
- Dataset size capped at 50MB
````

---

## ✅ Updated Pre-Submission Checklist

```
BRANDING
  [ ] App title shows "Alchemy" everywhere — browser tab, header, landing
  [ ] No "NatWest" or "Talk to Data" text anywhere in the UI
  [ ] globals.css loaded with new CSS variables
  [ ] Syne + DM Sans fonts loading from Google Fonts
  [ ] Orange gradient visible on buttons and accents
  [ ] Background is warm dark, not pure #000000

QUERY LIBRARY
  [ ] Save button appears on AnswerCard
  [ ] Clicking Save prompts for a name and saves to Supabase
  [ ] Library panel shows in left sidebar with saved queries
  [ ] Replay button runs the query again and increments use_count
  [ ] Delete button removes the entry
  [ ] Library persists after page refresh (it's in Supabase, not state)

DEMO DATASET REMOVAL
  [ ] No startup pre-load in main.py
  [ ] No default-session route in upload.py
  [ ] Landing page shows the upload zone, not a pre-loaded dataset
  [ ] metrics.json uses general-purpose definitions, not NatWest-specific ones

CORE FUNCTIONALITY (unchanged)
  [ ] CSV upload → schema detection → starter questions
  [ ] All 4 intents work: change, compare, breakdown, summary
  [ ] "This month" resolves silently, "last cycle" asks for clarification
  [ ] Show My Work drawer shows SQL + row count
  [ ] Signal-based confidence badge on every answer
  [ ] 429 rate limit shows retry prompt, not a crash
  [ ] Semantic layer editable and persists

DEPLOYMENT
  [ ] UptimeRobot pinging /health every 5 min
  [ ] DATABASE_URL set in Render environment
  [ ] Vercel deployment loads upload screen (not a NatWest dataset)
```

---

## 🎨 Quick Theme Reference Card

Use these values anywhere you need to add a new component:

| Use case | Value |
|----------|-------|
| Page background | `var(--bg-base)` / `#0C0A08` |
| Card background | `var(--bg-elevated)` / `#1E1A16` |
| Subtle card | `var(--bg-surface)` / `#151210` |
| Border | `var(--border-subtle)` / `#2A2420` |
| Primary button | `className="btn-orange"` |
| Orange text | `var(--orange-bright)` / `#E8832A` |
| Gradient text | `className="text-gradient-orange"` |
| Display headings | `fontFamily: 'var(--font-display)'` (Syne) |
| Body text | `fontFamily: 'var(--font-body)'` (DM Sans) |
| Muted text | `var(--text-muted)` / `#5C5248` |
| Glow on hover | `className="glow-orange"` |
