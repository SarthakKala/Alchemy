'use client';

import type { ReactNode } from 'react';

interface Props {
  /** Right side of header row (confidence pill, loading hint, …) */
  trailing?: ReactNode;
  /** Thin row under header: intent chips, Save, secondary actions */
  meta?: ReactNode;
  children: ReactNode;
  /** Error / warning outer treatment */
  tone?: 'default' | 'danger';
}

export function ChatAssistantFrame({
  trailing,
  meta,
  children,
  tone = 'default',
}: Props) {
  const outer =
    tone === 'danger'
      ? 'border-red-500/30 bg-[#181210] shadow-[0_12px_40px_rgba(0,0,0,0.5)]'
      : 'border-orange-950/35 bg-zinc-950 shadow-[0_14px_48px_rgba(0,0,0,0.72)] ring-1 ring-orange-500/[0.09]';

  return (
    <div className={`max-w-[min(92%,42rem)] overflow-hidden rounded-[22px] border ${outer}`}>
      <div className="flex items-center gap-3 border-b border-white/[0.06] bg-black/35 px-5 py-3.5 backdrop-blur-[2px]">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[15px] font-bold tracking-tight text-black shadow-[0_4px_14px_rgba(232,131,42,0.35)]"
          style={{
            background: 'linear-gradient(145deg, var(--orange-bright), var(--orange-base))',
          }}
          aria-hidden
        >
          A
        </div>
        <span
          className="text-[15px] font-semibold tracking-tight text-white"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Alchemy
        </span>
        <span className="min-w-2 flex-1" />
        {trailing}
      </div>
      {meta ? (
        <div className="border-b border-orange-950/25 bg-black/25 px-5 py-2.5">{meta}</div>
      ) : null}
      <div className="bg-[#0c0c0c] px-5 py-4">{children}</div>
    </div>
  );
}
