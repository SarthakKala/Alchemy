'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  sql: string;
  columnsUsed: string[];
  rowCount: number;
}

export function ShowMyWork({ sql, columnsUsed, rowCount }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-t border-zinc-800 pt-3">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition"
      >
        {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        How was this calculated?
      </button>

      {open && (
        <div className="mt-3 space-y-3">
          <div>
            <p className="text-xs text-zinc-500 mb-1">SQL Query</p>
            <pre className="bg-zinc-950 text-[#3ECF8E] text-xs p-3 rounded-lg overflow-x-auto whitespace-pre-wrap">
              {sql}
            </pre>
          </div>

          <div>
            <p className="text-xs text-zinc-500 mb-1">Columns referenced</p>
            <div className="flex flex-wrap gap-1">
              {columnsUsed.map((col) => (
                <span
                  key={col}
                  className="text-xs bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded"
                >
                  {col}
                </span>
              ))}
            </div>
          </div>

          <p className="text-xs text-zinc-500">
            {rowCount} row{rowCount !== 1 ? 's' : ''} matched this query.
          </p>
        </div>
      )}
    </div>
  );
}
