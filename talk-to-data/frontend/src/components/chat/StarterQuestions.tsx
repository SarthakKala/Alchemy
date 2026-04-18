'use client';

interface Props {
  questions: string[];
  onSelect: (q: string) => void;
}

export function StarterQuestions({ questions, onSelect }: Props) {
  if (!questions.length) return null;
  return (
    <div className="max-w-[min(92%,42rem)] space-y-4">
      <div className="flex items-center gap-2 px-1">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-black"
          style={{
            background: 'linear-gradient(145deg, var(--orange-bright), var(--orange-base))',
          }}
          aria-hidden
        >
          A
        </div>
        <div>
          <p className="text-[15px] font-semibold text-white" style={{ fontFamily: 'var(--font-display)' }}>
            Try asking
          </p>
          <p className="text-xs text-zinc-500">Pick a starter or type your own question below.</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2.5">
        {questions.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => onSelect(q)}
            className="max-w-full rounded-[20px] border border-orange-950/35 bg-zinc-950 px-4 py-3 text-left text-[13px] leading-snug text-zinc-300 shadow-[0_6px_28px_rgba(0,0,0,0.45)] ring-1 ring-orange-500/[0.05] transition hover:border-orange-500/45 hover:bg-[#141210] hover:text-orange-50"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}
