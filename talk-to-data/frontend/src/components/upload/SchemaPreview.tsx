'use client';

import type { UploadResponse } from '@/lib/types';

interface Props {
  uploadData: UploadResponse;
}

export function SchemaPreview({ uploadData }: Props) {
  return (
    <div>
      <h3 className="text-white text-sm font-medium mb-2">Schema</h3>
      <p className="text-zinc-500 text-xs mb-3 font-mono break-all">
        {uploadData.table_name}
      </p>
      <ul className="space-y-2 max-h-48 overflow-y-auto">
        {uploadData.columns.map((c) => (
          <li
            key={c.name}
            className="text-xs text-zinc-400 border border-zinc-800 rounded-lg px-2 py-1.5"
          >
            <span className="text-zinc-200 font-mono">{c.name}</span>
            <span className="text-zinc-600 ml-2">{c.type}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
