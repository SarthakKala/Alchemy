'use client';

import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { ChatAssistantFrame } from '@/components/chat/ChatAssistantFrame';

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
    <ChatAssistantFrame
      trailing={
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/35 bg-[#1f1a12] px-2.5 py-1 text-[11px] font-medium tracking-wide text-amber-100">
          <Sparkles className="h-3.5 w-3.5 text-amber-400" aria-hidden />
          Needs detail
        </span>
      }
    >
      <div className="space-y-4">
        <p className="text-[15px] leading-relaxed text-orange-100/95">{question}</p>
        <div className="flex flex-wrap gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. March 2024"
            className="min-w-[180px] flex-1 rounded-2xl border border-white/[0.1] bg-[#0d0d0d] px-4 py-2.5 text-[15px] text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-orange-400/60"
            onKeyDown={(e) => {
              if (e.key === 'Enter') resolve();
            }}
          />
          <button
            type="button"
            onClick={resolve}
            className="rounded-2xl bg-orange-500 px-5 py-2.5 text-[15px] font-semibold text-white shadow-lg transition hover:bg-orange-400"
          >
            Clarify
          </button>
        </div>
      </div>
    </ChatAssistantFrame>
  );
}
