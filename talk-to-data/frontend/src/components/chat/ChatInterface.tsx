'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnswerCard } from '@/components/answer/AnswerCard';
import { AmbiguityPrompt } from '@/components/answer/AmbiguityPrompt';
import { ChatAssistantFrame } from '@/components/chat/ChatAssistantFrame';
import { QueryInput } from './QueryInput';
import { StarterQuestions } from './StarterQuestions';
import { RateLimitError, runQuery } from '@/lib/api';
import type { HistoryItem, QueryResponse, UploadResponse } from '@/lib/types';

interface Props {
  uploadData: UploadResponse;
  onAddToHistory: (item: HistoryItem) => void;
  initialQuery?: string;
  onReplayConsumed?: () => void;
}

interface Message {
  id: string;
  query: string;
  response: QueryResponse | null;
  loading: boolean;
}

export function ChatInterface({
  uploadData,
  onAddToHistory,
  initialQuery,
  onReplayConsumed,
}: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [rateLimitSec, setRateLimitSec] = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (rateLimitSec === null || rateLimitSec <= 0) return;
    const t = setInterval(() => {
      setRateLimitSec((s) => (s !== null && s > 0 ? s - 1 : null));
    }, 1000);
    return () => clearInterval(t);
  }, [rateLimitSec]);

  const handleQuery = useCallback(
    async (
      query: string,
      clarificationResolved = false,
      resolvedQuery?: string
    ) => {
      const msgId = Date.now().toString();
      setIsLoading(true);

      setMessages((prev) => [
        ...prev,
        { id: msgId, query, response: null, loading: true },
      ]);

      try {
        const response = await runQuery(
          uploadData.session_id,
          uploadData.table_name,
          query,
          clarificationResolved,
          resolvedQuery
        );

        setMessages((prev) =>
          prev.map((m) =>
            m.id === msgId ? { ...m, response, loading: false } : m
          )
        );

        if (response.answer_text && !response.incoherent) {
          onAddToHistory({
            id: msgId,
            query,
            answer: response.answer_text,
            timestamp: new Date(),
            confidence: response.confidence || 'medium',
          });
        }
      } catch (e) {
        let errText: string;
        if (e instanceof RateLimitError) {
          setRateLimitSec(e.retryAfter);
          errText = `Rate limited. Retry in ${e.retryAfter}s.`;
        } else if (e instanceof Error) {
          errText = e.message;
        } else {
          errText = 'Request failed.';
        }
        setMessages((prev) =>
          prev.map((m) =>
            m.id === msgId
              ? {
                  ...m,
                  response: {
                    error: errText,
                  } as QueryResponse,
                  loading: false,
                }
              : m
          )
        );
      } finally {
        setIsLoading(false);
      }
    },
    [onAddToHistory, uploadData.session_id, uploadData.table_name]
  );

  useEffect(() => {
    if (!initialQuery) return;
    void handleQuery(initialQuery);
    onReplayConsumed?.();
  }, [handleQuery, initialQuery, onReplayConsumed]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {rateLimitSec !== null && rateLimitSec > 0 && (
        <div className="mx-5 mt-4 rounded-2xl border border-amber-500/25 bg-amber-500/10 px-4 py-2.5 text-xs text-amber-200">
          Rate limited. Retry in {rateLimitSec}s…
        </div>
      )}
      <div className="chat-panel-scroll flex-1 space-y-8 overflow-y-auto bg-[#050505] px-4 pb-6 pt-5 md:px-6 md:pb-8 md:pt-6">
        {messages.length === 0 && (
          <StarterQuestions
            questions={uploadData.starter_questions}
            onSelect={(q) => void handleQuery(q)}
          />
        )}

        {messages.map((msg) => (
          <div key={msg.id} className="flex flex-col gap-4">
            <div className="flex justify-end">
              <div className="max-w-[min(88%,28rem)] rounded-[22px] rounded-br-md border border-orange-500/30 bg-gradient-to-br from-[#2c221c] to-[#1a1512] px-5 py-3.5 text-[15px] leading-[1.65] text-[#fde8d8] shadow-[inset_0_1px_0_rgba(255,180,120,0.12),0_10px_36px_rgba(0,0,0,0.55)]">
                {msg.query}
              </div>
            </div>

            {msg.loading && (
              <ChatAssistantFrame
                trailing={
                  <span className="text-[11px] font-medium tracking-wide text-sky-300/70">
                    Analysing…
                  </span>
                }
              >
                <div className="space-y-3 pt-1">
                  <div className="h-3.5 w-[92%] animate-pulse rounded-lg bg-orange-950/50" />
                  <div className="h-3.5 w-[78%] animate-pulse rounded-lg bg-zinc-800/70" />
                  <div className="h-3.5 w-[56%] animate-pulse rounded-lg bg-zinc-800/60" />
                </div>
              </ChatAssistantFrame>
            )}

            {msg.response && !msg.loading && (
              <>
                {msg.response.is_ambiguous ? (
                  <AmbiguityPrompt
                    question={msg.response.clarification_question || ''}
                    originalQuery={msg.query}
                    onResolve={(resolved) =>
                      void handleQuery(msg.query, true, resolved)
                    }
                  />
                ) : (
                  <AnswerCard response={msg.response} sessionId={uploadData.session_id} />
                )}
              </>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="shrink-0 border-t border-[var(--border-subtle)] bg-[#0a0a0a]/80 px-4 py-4 backdrop-blur-sm md:px-5">
        <QueryInput
          onSubmit={(q) => void handleQuery(q)}
          disabled={isLoading}
        />
      </div>
    </div>
  );
}
