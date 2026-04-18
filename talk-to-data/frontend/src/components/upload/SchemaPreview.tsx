'use client';

import type { UploadResponse } from '@/lib/types';

interface Props {
  uploadData: UploadResponse;
}

export function SchemaPreview({ uploadData }: Props) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-white">Schema</h3>
      <p className="mb-3 break-all font-mono text-xs text-[var(--text-muted)]">
        {uploadData.table_name}
      </p>
      <ul className="space-y-2 pr-1">
        {uploadData.columns.map((c) => (
          <li
            key={c.name}
            className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-overlay)] px-2.5 py-2 text-xs text-zinc-400"
          >
            <span className="font-mono text-zinc-200">{c.name}</span>
            <span className="ml-2 text-zinc-600">{c.type}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
