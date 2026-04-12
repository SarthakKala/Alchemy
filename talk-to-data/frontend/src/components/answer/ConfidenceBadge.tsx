'use client';

interface Props {
  level: 'high' | 'medium' | 'low';
  reason: string;
}

const CONFIG = {
  high: {
    label: 'High confidence',
    color: 'bg-[#3ECF8E]/10 text-[#3ECF8E] border-[#3ECF8E]/20',
  },
  medium: {
    label: 'Medium confidence',
    color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  },
  low: {
    label: 'Low confidence',
    color: 'bg-red-500/10 text-red-400 border-red-500/20',
  },
};

export function ConfidenceBadge({ level, reason }: Props) {
  const { label, color } = CONFIG[level];
  return (
    <span
      title={reason}
      className={`text-xs px-2 py-0.5 rounded-full border ${color} cursor-help`}
    >
      {label}
    </span>
  );
}
