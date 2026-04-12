'use client';

import { useEffect, useRef, useState } from 'react';
import { AnswerCard } from '@/components/answer/AnswerCard';
import { AmbiguityPrompt } from '@/components/answer/AmbiguityPrompt';
import { QueryInput } from './QueryInput';
import { StarterQuestions } from './StarterQuestions';
import { RateLimitError, runQuery } from '@/lib/api';
import type { HistoryItem, QueryResponse, UploadResponse } from '@/lib/types';

interface Props {
  uploadData: UploadResponse;
  onAddToHistory: (item: HistoryItem) => void;
}

interface Message {
  id: string;
  query: string;
  response: QueryResponse | null;
  loading: boolean;
}

export function ChatInterface({ uploadData, onAddToHistory }: Props) {
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

  const handleQuery = async (
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

      if (response.answer_text) {
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
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {rateLimitSec !== null && rateLimitSec > 0 && (
        <div className="mx-4 mt-2 text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-3 py-2">
          Rate limited. Retry in {rateLimitSec}s…
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 && (
          <StarterQuestions
            questions={uploadData.starter_questions}
            onSelect={(q) => void handleQuery(q)}
          />
        )}

        {messages.map((msg) => (
          <div key={msg.id} className="space-y-3">
            <div className="flex justify-end">
              <div className="bg-zinc-800 text-white px-4 py-2 rounded-2xl rounded-tr-sm max-w-lg text-sm">
                {msg.query}
              </div>
            </div>

            {msg.loading && (
              <div className="text-zinc-500 text-sm animate-pulse pl-2">
                Analysing your data...
              </div>
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
                  <AnswerCard response={msg.response} />
                )}
              </>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-zinc-800 p-4 shrink-0">
        <QueryInput
          onSubmit={(q) => void handleQuery(q)}
          disabled={isLoading}
        />
      </div>
    </div>
  );
}
