'use client';

import { useState } from 'react';
import { MetricEditor } from '@/components/semantic/MetricEditor';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { QueryLibrary } from '@/components/library/QueryLibrary';
import { QueryHistory } from '@/components/sidebar/QueryHistory';
import { SchemaPreview } from '@/components/upload/SchemaPreview';
import { UploadZone } from '@/components/upload/UploadZone';
import type { HistoryItem, UploadResponse } from '@/lib/types';

export default function HomePage() {
  const [uploadData, setUploadData] = useState<UploadResponse | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [replayQuery, setReplayQuery] = useState<string | undefined>();

  const handleUploadComplete = (data: UploadResponse) => {
    setUploadData(data);
    setHistory([]);
  };

  const addToHistory = (item: HistoryItem) => {
    setHistory((prev) => [item, ...prev]);
  };

  if (!uploadData) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center p-8">
        <div className="w-full max-w-2xl">
          <h1 className="text-4xl font-bold text-orange-400 mb-2">Alchemy</h1>
          <p className="text-zinc-400 mb-8">
            Upload any CSV and ask questions in plain English. Instant, sourced,
            auditable answers.
          </p>
          <UploadZone onUploadComplete={handleUploadComplete} />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black flex">
      <aside className="w-64 border-r border-zinc-800 p-4 shrink-0 hidden md:block">
        <div className="text-orange-400 text-sm font-semibold mb-4">Alchemy</div>
        <QueryHistory history={history} />
        <QueryLibrary sessionId={uploadData.session_id} onReplay={(q) => setReplayQuery(q)} />
      </aside>

      <section className="flex-1 flex flex-col min-h-screen min-w-0 overflow-hidden">
        <div className="p-4 border-b border-zinc-800 flex items-center gap-3 shrink-0">
          <span className="text-white font-medium truncate">{uploadData.filename}</span>
          <span className="text-zinc-400 text-sm shrink-0">
            {uploadData.row_count} rows
          </span>
          <button
            type="button"
            className="ml-auto text-sm text-zinc-400 hover:text-orange-300 transition shrink-0"
            onClick={() => setUploadData(null)}
          >
            Upload new file
          </button>
        </div>
        <ChatInterface
          uploadData={uploadData}
          onAddToHistory={addToHistory}
          initialQuery={replayQuery}
          onReplayConsumed={() => setReplayQuery(undefined)}
        />
      </section>

      <aside className="w-72 border-l border-zinc-800 p-4 shrink-0 overflow-y-auto hidden lg:block">
        <SchemaPreview uploadData={uploadData} />
        <div className="mt-6">
          <MetricEditor />
        </div>
      </aside>
    </main>
  );
}
