'use client';

import { useState, type FormEvent } from 'react';

interface Props {
  onSubmit: (q: string) => void;
  disabled?: boolean;
}

export function QueryInput({ onSubmit, disabled }: Props) {
  const [value, setValue] = useState('');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const q = value.trim();
    if (!q || disabled) return;
    onSubmit(q);
    setValue('');
  };

  return (
    <form onSubmit={submit} className="flex gap-2">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Ask a question about your data..."
        disabled={disabled}
        className="flex-1 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-overlay)] px-4 py-3 text-sm text-white outline-none focus:border-orange-400 disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        className="rounded-2xl bg-orange-500 px-5 py-3 text-sm font-medium text-white hover:bg-orange-400 disabled:opacity-50"
      >
        Send
      </button>
    </form>
  );
}
