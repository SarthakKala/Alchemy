'use client';

interface Props {
  questions: string[];
  onSelect: (q: string) => void;
}

export function StarterQuestions({ questions, onSelect }: Props) {
  if (!questions.length) return null;
  return (
    <div className="space-y-3">
      <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">Try asking</p>
      <div className="flex flex-wrap gap-2">
        {questions.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => onSelect(q)}
            className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-overlay)] px-3 py-2.5 text-left text-xs text-zinc-300 transition hover:border-orange-400/50 hover:text-orange-100"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}
