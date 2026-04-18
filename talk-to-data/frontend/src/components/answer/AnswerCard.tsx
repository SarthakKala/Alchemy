'use client';

import { useMemo, useState } from 'react';
import type { QueryResponse } from '@/lib/types';
import { DynamicChart } from '@/components/charts/DynamicChart';
import { deleteSavedQuery, formatApiError, saveQuery } from '@/lib/api';
import { BookmarkIcon } from 'lucide-react';
import { ChatAssistantFrame } from '@/components/chat/ChatAssistantFrame';
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

  const isSaved = Boolean(savedId);

  const metaRow =
    response.user_query && !response.incoherent ? (
      <div className="flex flex-wrap items-center gap-2">
        {response.intent ? (
          <span className="rounded-full border border-orange-950/40 bg-black/40 px-2.5 py-1 text-[11px] font-medium capitalize tracking-wide text-zinc-400">
            {response.intent}
          </span>
        ) : null}
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
            'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold transition-colors',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500/60',
            pending
              ? 'cursor-wait border-orange-500/40 bg-orange-500/20 text-orange-50'
              : isSaved
                ? 'cursor-pointer border-orange-400/60 bg-orange-500/30 text-white shadow-[0_2px_14px_rgba(232,131,42,0.25)] hover:bg-orange-500/40'
                : 'cursor-pointer border-orange-400/55 bg-orange-500/30 text-white shadow-[0_2px_16px_rgba(232,131,42,0.22)] hover:border-orange-300/60 hover:bg-orange-500/45',
          ].join(' ')}
        >
          <BookmarkIcon
            size={12}
            strokeWidth={2}
            className={pending ? 'opacity-70' : ''}
            fill={isSaved && !pending ? 'currentColor' : 'none'}
          />
          {pending ? 'Saving…' : isSaved ? 'Saved' : 'Save'}
        </button>
      </div>
    ) : response.intent ? (
      <span className="rounded-full border border-orange-950/40 bg-black/40 px-2.5 py-1 text-[11px] font-medium capitalize tracking-wide text-zinc-400">
        {response.intent}
      </span>
    ) : null;

  if (response.error) {
    return (
      <ChatAssistantFrame tone="danger" trailing={<span className="text-xs font-medium text-red-400/90">Issue</span>}>
        <p className="text-[15px] leading-relaxed text-red-300/95">{response.error}</p>
      </ChatAssistantFrame>
    );
  }

  const confidenceHeader =
    response.confidence ? (
      <ConfidenceBadge level={response.confidence} reason={response.confidence_reason || ''} variant="header" />
    ) : null;

  const body = (
    <div className="space-y-5">
      {response.answer_text ? (
        <p className="text-[15px] leading-[1.65] text-zinc-100">{response.answer_text}</p>
      ) : null}

      {response.chart_data && response.chart_data.length > 0 ? (
        <div className="-mx-1 rounded-xl border border-orange-950/35 bg-black/50 p-3 shadow-inner">
          <DynamicChart
            type={response.chart_type || 'bar'}
            data={response.chart_data}
            columns={response.columns_used || []}
          />
        </div>
      ) : null}

      {response.generated_sql ? (
        <ShowMyWork
          sql={response.generated_sql}
          columnsUsed={response.columns_used || []}
          rowCount={response.row_count || 0}
        />
      ) : null}
    </div>
  );

  return (
    <ChatAssistantFrame trailing={confidenceHeader} meta={metaRow || undefined}>
      {body}
    </ChatAssistantFrame>
  );
}
