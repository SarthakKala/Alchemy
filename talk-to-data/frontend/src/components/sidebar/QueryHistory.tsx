'use client';

import type { HistoryItem } from '@/lib/types';

interface Props {
  history: HistoryItem[];
}

export function QueryHistory({ history }: Props) {
  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold text-white">History</h2>
      {history.length === 0 ? (
        <p className="text-zinc-600 text-xs">Ask a question to build history.</p>
      ) : (
        <ul className="space-y-2">
          {history.map((h) => (
            <li
              key={h.id}
              className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-overlay)] p-2 text-xs text-zinc-400 transition hover:border-orange-500/40"
            >
              <p className="text-zinc-300 line-clamp-2">{h.query}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
