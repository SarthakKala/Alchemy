'use client';

import { useState } from 'react';
import { MetricEditor } from '@/components/semantic/MetricEditor';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { QueryLibrary } from '@/components/library/QueryLibrary';
import { QueryHistory } from '@/components/sidebar/QueryHistory';
import { SchemaPreview } from '@/components/upload/SchemaPreview';
import { UploadZone } from '@/components/upload/UploadZone';
import { PixelBlast } from '@/components/ui/pixel-blast';
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
      <main className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center p-8">
        <div className="absolute inset-0 opacity-85">
          <PixelBlast
            variant="circle"
            pixelSize={8}
            color="#E8832A"
            patternScale={3}
            patternDensity={0.1}
            pixelSizeJitter={0.5}
            enableRipples
            rippleSpeed={0.4}
            rippleThickness={0.52}
            rippleIntensityScale={1.5}
            speed={0.6}
            edgeFade={0.12}
            transparent
            noiseAmount={0.05}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/65" />

        <div className="relative z-10 w-full max-w-3xl rounded-2xl border border-orange-500/20 bg-black/65 backdrop-blur-sm p-8 md:p-10 shadow-[0_0_60px_rgba(232,131,42,0.18)]">
          <h1 className="text-center text-white font-bold text-5xl md:text-6xl mb-4">Alchemy</h1>
          <p className="text-center text-zinc-200 text-sm md:text-base mb-8">
            Upload any CSV and get instant plain-English insights with sourced, auditable answers.
          </p>
          <div className="max-w-xl mx-auto rounded-xl border border-orange-500/25 bg-black/45 p-5 md:p-6">
            <UploadZone onUploadComplete={handleUploadComplete} />
          </div>
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
