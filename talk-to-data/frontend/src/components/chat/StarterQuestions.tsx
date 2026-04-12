'use client';

interface Props {
  questions: string[];
  onSelect: (q: string) => void;
}

export function StarterQuestions({ questions, onSelect }: Props) {
  if (!questions.length) return null;
  return (
    <div className="space-y-2">
      <p className="text-zinc-500 text-xs uppercase tracking-wide">Try asking</p>
      <div className="flex flex-wrap gap-2">
        {questions.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => onSelect(q)}
            className="text-left text-xs bg-zinc-900 border border-zinc-800 text-zinc-300 px-3 py-2 rounded-lg hover:border-[#3ECF8E]/50 transition"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}
