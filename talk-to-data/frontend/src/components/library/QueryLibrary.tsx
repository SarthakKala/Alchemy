'use client';

import { useEffect, useState } from 'react';
import { BookmarkIcon, PlayIcon, TrashIcon } from 'lucide-react';
import { deleteSavedQuery, getLibrary, replaySavedQuery } from '@/lib/api';
import type { SavedQuery } from '@/lib/types';

interface Props {
  sessionId: string;
  onReplay: (queryText: string) => void;
}

export function QueryLibrary({ sessionId, onReplay }: Props) {
  const [library, setLibrary] = useState<SavedQuery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLibrary(sessionId)
      .then(setLibrary)
      .finally(() => setLoading(false));
  }, [sessionId]);

  const handleReplay = async (item: SavedQuery) => {
    await replaySavedQuery(sessionId, item.id);
    setLibrary((prev) =>
      prev.map((q) =>
        q.id === item.id
          ? { ...q, use_count: q.use_count + 1, last_used: new Date().toISOString() }
          : q
      )
    );
    onReplay(item.query_text);
  };

  const handleDelete = async (id: string) => {
    await deleteSavedQuery(sessionId, id);
    setLibrary((prev) => prev.filter((q) => q.id !== id));
  };

  const intentColor: Record<string, string> = {
    change: 'text-orange-bright border-orange-dim',
    compare: 'text-blue-400 border-blue-900',
    breakdown: 'text-purple-400 border-purple-900',
    summary: 'text-orange-300 border-orange-900',
  };

  return (
    <div className="mt-6">
      <div className="mb-3 flex items-center gap-2">
        <BookmarkIcon size={13} className="text-orange-400" />
        <h3
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.08em',
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
          }}
        >
          Query Library
        </h3>
        {library.length > 0 && (
          <span
            className="ml-auto rounded-full px-1.5 py-0.5 text-xs"
            style={{ background: 'var(--bg-overlay)', color: 'var(--text-muted)' }}
          >
            {library.length}
          </span>
        )}
      </div>

      {loading && <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Loading...</p>}

      {!loading && library.length === 0 && (
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
          Save queries you want to reuse. Click the bookmark icon on any answer.
        </p>
      )}

      <div className="space-y-1.5">
        {library.map((item) => (
          <div
            key={item.id}
            className="group rounded-lg p-2.5 transition-all"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item.name}
                </p>
                <p
                  style={{
                    fontSize: '11px',
                    color: 'var(--text-muted)',
                    marginTop: '2px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item.query_text}
                </p>
                <div className="mt-1.5 flex items-center gap-2">
                  {item.intent && (
                    <span
                      className={`rounded border px-1.5 py-0.5 text-xs ${intentColor[item.intent] || 'text-text-secondary border-border-subtle'}`}
                      style={{ fontSize: '10px' }}
                    >
                      {item.intent}
                    </span>
                  )}
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>x{item.use_count}</span>
                </div>
              </div>

              <div className="flex flex-shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={() => void handleReplay(item)}
                  className="rounded p-1 transition-colors hover:bg-orange-500/20"
                  title="Replay this query"
                >
                  <PlayIcon size={11} className="text-orange-300" />
                </button>
                <button
                  onClick={() => void handleDelete(item.id)}
                  className="rounded p-1 transition-colors hover:bg-red-900/30"
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
