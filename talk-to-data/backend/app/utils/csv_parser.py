"""CSV bytes → database table via pandas + SQLAlchemy."""

import re
from io import BytesIO
from typing import Any, Dict

from sqlalchemy import text
from sqlalchemy.engine import Engine

from app.core.database import session_table_name


def _ensure_postgres_primary_key(engine: Engine, table_name: str) -> None:
    """
    pandas.to_sql() creates tables with no primary key; Supabase UI requires a PK
    to delete/update rows. Add a surrogate `id` column when missing.
    """
    if engine.dialect.name != "postgresql":
        return

    with engine.connect() as conn:
        pk_count = conn.execute(
            text(
                """
                SELECT COUNT(*) FROM information_schema.table_constraints
                WHERE table_schema = 'public'
                  AND table_name = :t
                  AND constraint_type = 'PRIMARY KEY'
                """
            ),
            {"t": table_name},
        ).scalar()
        if pk_count:
            return

        has_id = conn.execute(
            text(
                """
                SELECT COUNT(*) FROM information_schema.columns
                WHERE table_schema = 'public'
                  AND table_name = :t
                  AND column_name = 'id'
                """
            ),
            {"t": table_name},
        ).scalar()

        if not has_id:
            conn.execute(
                text(f'ALTER TABLE "{table_name}" ADD COLUMN id BIGSERIAL PRIMARY KEY')
            )
        else:
            conn.execute(
                text(f'ALTER TABLE "{table_name}" ADD PRIMARY KEY (id)')
            )
        conn.commit()


def ingest_csv(
    file_bytes: bytes,
    filename: str,
    engine: Engine,
    session_id: str,
) -> Dict[str, Any]:
    """
    Parse CSV and load into table session_<sanitized_session_id>.
    Returns table_name, columns metadata, row_count, filename.
    """
    import pandas as pd

    df = pd.read_csv(BytesIO(file_bytes))

    df.columns = [
        re.sub(r"[^a-z0-9_]", "_", col.lower().strip())
        for col in df.columns
    ]

    table_name = session_table_name(session_id)
    df.to_sql(table_name, engine, if_exists="replace", index=False)
    _ensure_postgres_primary_key(engine, table_name)

    columns = []
    for col in df.columns:
        columns.append(
            {
                "name": col,
                "type": str(df[col].dtype),
                "sample": df[col].dropna().head(3).tolist(),
                "null_count": int(df[col].isnull().sum()),
            }
        )

    return {
        "table_name": table_name,
        "columns": columns,
        "row_count": len(df),
        "filename": filename,
    }
