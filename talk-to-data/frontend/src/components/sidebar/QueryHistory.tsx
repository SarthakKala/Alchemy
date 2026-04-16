'use client';

import type { HistoryItem } from '@/lib/types';

interface Props {
  history: HistoryItem[];
}

export function QueryHistory({ history }: Props) {
  return (
    <div>
      <h2 className="text-orange-400 text-sm font-medium mb-3">History</h2>
      {history.length === 0 ? (
        <p className="text-zinc-600 text-xs">Ask a question to build history.</p>
      ) : (
        <ul className="space-y-2">
          {history.map((h) => (
            <li
              key={h.id}
              className="text-xs text-zinc-400 border border-zinc-800 rounded-lg p-2 hover:border-orange-500/40 transition"
            >
              <p className="text-zinc-300 line-clamp-2">{h.query}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
