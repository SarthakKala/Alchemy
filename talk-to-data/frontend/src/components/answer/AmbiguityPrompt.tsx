'use client';

import { useState } from 'react';

interface Props {
  question: string;
  originalQuery: string;
  onResolve: (resolvedQuery: string) => void;
}

export function AmbiguityPrompt({
  question,
  originalQuery,
  onResolve,
}: Props) {
  const [input, setInput] = useState('');

  const resolve = () => {
    if (!input.trim()) return;
    onResolve(`${originalQuery} (specifically: ${input.trim()})`);
  };

  return (
    <div
      className="max-w-2xl space-y-3 rounded-xl border border-orange-500/25 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
      style={{ background: 'var(--gradient-card)' }}
    >
      <p className="text-sm text-[var(--orange-bright)]">{question}</p>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. March 2024"
          className="flex-1 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-overlay)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-orange-400"
          onKeyDown={(e) => {
            if (e.key === 'Enter') resolve();
          }}
        />
        <button
          type="button"
          onClick={resolve}
          className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-orange-400"
        >
          Clarify
        </button>
      </div>
    </div>
  );
}
