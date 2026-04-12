"""Infer column roles from DB metadata and row stats."""

from typing import Dict, List

from sqlalchemy import inspect as sa_inspect, text
from sqlalchemy.engine import Engine


def detect_schema(engine: Engine, table_name: str) -> Dict:
    """
    Categorise columns: date, numeric, categorical (low cardinality), text.
    """
    insp = sa_inspect(engine)
    cols = insp.get_columns(table_name)

    date_cols: List[str] = []
    numeric_cols: List[str] = []
    categorical_cols: List[str] = []
    text_cols: List[str] = []

    with engine.connect() as conn:
        total = conn.execute(text(f'SELECT COUNT(*) FROM "{table_name}"')).scalar() or 1

        for col in cols:
            col_name = col["name"]
            col_type = str(col["type"]).upper()

            if any(
                k in col_name.lower()
                for k in ["date", "time", "month", "year", "week"]
            ):
                date_cols.append(col_name)
            elif any(
                t in col_type
                for t in ["INT", "FLOAT", "NUMERIC", "REAL", "DOUBLE", "DECIMAL"]
            ):
                numeric_cols.append(col_name)
            else:
                distinct = (
                    conn.execute(
                        text(f'SELECT COUNT(DISTINCT "{col_name}") FROM "{table_name}"')
                    ).scalar()
                    or 0
                )
                if total > 0 and distinct / total < 0.2:
                    categorical_cols.append(col_name)
                else:
                    text_cols.append(col_name)

    return {
        "date_columns": date_cols,
        "numeric_columns": numeric_cols,
        "categorical_columns": categorical_cols,
        "text_columns": text_cols,
    }


def generate_starter_questions(schema: Dict, table_name: str) -> List[str]:
    """Build up to five suggested questions from schema hints."""
    questions: List[str] = []
    num = schema["numeric_columns"]
    cat = schema["categorical_columns"]
    date = schema["date_columns"]

    if num:
        questions.append(f"What is the total {num[0]}?")
    if num and cat:
        questions.append(f"Show the breakdown of {num[0]} by {cat[0]}.")
    if len(num) >= 2 and cat:
        questions.append(f"Which {cat[0]} has the highest {num[0]}?")
    elif len(num) >= 1 and cat:
        questions.append(f"Which {cat[0]} has the highest {num[0]}?")
    if date and num:
        questions.append(f"How did {num[0]} change over {date[0]}?")
    if cat and num and len(questions) < 5:
        questions.append(f"Compare {num[0]} across different {cat[0]} values.")

    return questions[:5]
