'use client';

import { Sparkles } from 'lucide-react';

interface Props {
  level: 'high' | 'medium' | 'low';
  reason: string;
  /** Compact “AI agent” pill for chat header — matches polished chat UI */
  variant?: 'inline' | 'header';
}

const CONFIG = {
  high: {
    label: 'High confidence',
    color:
      'bg-orange-500/10 text-orange-300 border-orange-500/25',
    headerColor:
      'border-sky-500/35 bg-[#162032] text-sky-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]',
  },
  medium: {
    label: 'Medium confidence',
    color:
      'bg-amber-500/10 text-amber-300 border-amber-500/25',
    headerColor:
      'border-sky-500/30 bg-[#161e2e] text-sky-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]',
  },
  low: {
    label: 'Low confidence',
    color:
      'bg-red-500/10 text-red-400 border-red-500/25',
    headerColor:
      'border-slate-600/50 bg-[#1a1a22] text-slate-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]',
  },
};

export function ConfidenceBadge({ level, reason, variant = 'inline' }: Props) {
  const cfg = CONFIG[level];
  const label = cfg.label;

  if (variant === 'header') {
    return (
      <span
        title={reason}
        className={`inline-flex cursor-help items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium tracking-wide ${cfg.headerColor}`}
      >
        <Sparkles className="h-3.5 w-3.5 shrink-0 text-sky-400" aria-hidden />
        {label}
      </span>
    );
  }

  return (
    <span
      title={reason}
      className={`cursor-help rounded-full border px-2 py-0.5 text-xs ${cfg.color}`}
    >
      {label}
    </span>
  );
}
