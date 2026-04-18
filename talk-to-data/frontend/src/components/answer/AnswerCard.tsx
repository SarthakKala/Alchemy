'use client';

import { useMemo, useState } from 'react';
import type { QueryResponse } from '@/lib/types';
import { DynamicChart } from '@/components/charts/DynamicChart';
import { deleteSavedQuery, formatApiError, saveQuery } from '@/lib/api';
import { BookmarkIcon } from 'lucide-react';
import { ConfidenceBadge } from './ConfidenceBadge';
import { ShowMyWork } from './ShowMyWork';
import { useQueryLibrary } from '@/contexts/QueryLibraryContext';

interface Props {
  response: QueryResponse;
  sessionId: string;
}

export function AnswerCard({ response, sessionId }: Props) {
  const { entries, refresh } = useQueryLibrary();
  const [pending, setPending] = useState(false);

  const savedId = useMemo(() => {
    const q = (response.user_query || '').trim();
    if (!q) return undefined;
    return entries.find((s) => s.query_text.trim() === q)?.id;
  }, [entries, response.user_query]);

  const handleToggleSave = async () => {
    const raw = response.user_query?.trim();
    if (!raw || pending) return;

    setPending(true);
    try {
      if (savedId) {
        await deleteSavedQuery(sessionId, savedId);
      } else {
        const name = raw.slice(0, 80) || 'Saved query';
        await saveQuery(sessionId, name, raw, response.intent);
      }
      await refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : formatApiError(e));
    } finally {
      setPending(false);
    }
  };

  if (response.error) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
        {response.error}
      </div>
    );
  }

  const isSaved = Boolean(savedId);

  return (
    <div
      className="max-w-2xl space-y-4 rounded-xl border border-[var(--border-subtle)] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
      style={{ background: 'var(--gradient-card)' }}
    >
      <div className="flex flex-wrap items-center gap-2">
        {response.intent && (
          <span className="rounded-md border border-[var(--border-subtle)] bg-[var(--bg-overlay)] px-2 py-1 text-xs capitalize text-[var(--text-secondary)]">
            {response.intent}
          </span>
        )}
        {response.user_query && (
          <button
            type="button"
            aria-pressed={isSaved}
            aria-busy={pending}
            disabled={pending}
            title={
              pending
                ? 'Updating library…'
                : isSaved
                  ? 'Click to remove from Query Library'
                  : 'Save to Query Library'
            }
            onClick={() => void handleToggleSave()}
            className={[
              'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500/60',
              pending
                ? 'cursor-wait border-orange-500/35 bg-orange-500/15 text-orange-100'
                : isSaved
                  ? 'cursor-pointer border-orange-400/55 bg-orange-500/25 text-orange-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] hover:bg-orange-500/35 hover:border-orange-400/70'
                  : 'cursor-pointer border-orange-500/45 bg-orange-500/[0.14] text-orange-100 hover:bg-orange-500/25 hover:border-orange-400/55 active:bg-orange-500/30',
            ].join(' ')}
          >
            <BookmarkIcon
              size={13}
              strokeWidth={2}
              className={pending ? 'opacity-70' : ''}
              fill={isSaved && !pending ? 'currentColor' : 'none'}
            />
            {pending ? 'Saving…' : isSaved ? 'Saved' : 'Save'}
          </button>
        )}
        {response.confidence && (
          <ConfidenceBadge
            level={response.confidence}
            reason={response.confidence_reason || ''}
          />
        )}
      </div>

      {response.answer_text && (
        <p className="text-sm leading-relaxed text-[var(--text-primary)]">{response.answer_text}</p>
      )}

      {response.chart_data && response.chart_data.length > 0 && (
        <DynamicChart
          type={response.chart_type || 'bar'}
          data={response.chart_data}
          columns={response.columns_used || []}
        />
      )}

      {response.generated_sql && (
        <ShowMyWork
          sql={response.generated_sql}
          columnsUsed={response.columns_used || []}
          rowCount={response.row_count || 0}
        />
      )}
    </div>
  );
}
