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
    <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4 space-y-3 max-w-2xl">
      <p className="text-yellow-400 text-sm">{question}</p>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. March 2024"
          className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-white outline-none focus:border-orange-400"
          onKeyDown={(e) => {
            if (e.key === 'Enter') resolve();
          }}
        />
        <button
          type="button"
          onClick={resolve}
          className="bg-orange-500 text-black px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-orange-400 transition"
        >
          Clarify
        </button>
      </div>
    </div>
  );
}
