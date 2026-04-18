'use client';

import { useEffect, useState } from 'react';
import { MetricEditor } from '@/components/semantic/MetricEditor';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { QueryLibrary } from '@/components/library/QueryLibrary';
import { QueryHistory } from '@/components/sidebar/QueryHistory';
import { SchemaPreview } from '@/components/upload/SchemaPreview';
import { UploadZone } from '@/components/upload/UploadZone';
import { PixelBlast } from '@/components/ui/pixel-blast';
import { QueryLibraryProvider } from '@/contexts/QueryLibraryContext';
import type { HistoryItem, UploadResponse } from '@/lib/types';

export default function HomePage() {
  const [uploadData, setUploadData] = useState<UploadResponse | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [replayQuery, setReplayQuery] = useState<string | undefined>();
  const [introReady, setIntroReady] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setIntroReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

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
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: '#090909',
            backgroundImage:
              'radial-gradient(circle at 20% 15%, rgba(232,131,42,0.24) 0 1px, transparent 1.2px), radial-gradient(circle at 80% 35%, rgba(232,131,42,0.17) 0 1px, transparent 1.3px)',
            backgroundSize: '10px 10px, 13px 13px',
            opacity: 0.42,
          }}
        />
        <div className={`absolute inset-0 opacity-85 ${introReady ? 'intro-bg-fade' : 'opacity-0'}`}>
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

        <div
          className={`relative z-10 w-full max-w-3xl rounded-2xl border border-orange-500/20 bg-black/65 backdrop-blur-sm p-8 md:p-10 shadow-[0_0_60px_rgba(232,131,42,0.18)] ${introReady ? 'intro-card-fade' : 'opacity-0'}`}
        >
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
    <QueryLibraryProvider sessionId={uploadData.session_id}>
    <main className="h-[100dvh] min-h-0 bg-black flex gap-4 p-4 md:p-5 lg:p-6 overflow-hidden">
      <aside className="hidden md:flex w-64 shrink-0 flex-col gap-4 min-h-0 overflow-y-auto">
        <h1
          className="shrink-0 px-0 pb-1 pt-0 text-3xl font-bold tracking-tight text-white md:text-4xl"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Alchemy
        </h1>

        <div className="dashboard-card flex flex-col min-h-[140px] max-h-[38vh] shrink-0 overflow-hidden p-4">
          <div className="min-h-0 flex-1 overflow-y-auto">
            <QueryHistory history={history} />
          </div>
        </div>

        <div className="dashboard-card flex min-h-0 flex-1 flex-col overflow-hidden p-4">
          <QueryLibrary sessionId={uploadData.session_id} onReplay={(q) => setReplayQuery(q)} />
        </div>
      </aside>

      <section className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-hidden">
        <div className="dashboard-card flex shrink-0 items-center gap-3 px-5 py-4">
          <span className="truncate text-sm font-semibold text-white">{uploadData.filename}</span>
          <span className="shrink-0 text-sm text-zinc-400">{uploadData.row_count} rows</span>
          <button
            type="button"
            className="ml-auto shrink-0 text-sm text-zinc-400 transition hover:text-orange-300"
            onClick={() => setUploadData(null)}
          >
            Upload new file
          </button>
        </div>

        <div className="dashboard-card flex min-h-0 flex-1 flex-col overflow-hidden">
          <ChatInterface
            uploadData={uploadData}
            onAddToHistory={addToHistory}
            initialQuery={replayQuery}
            onReplayConsumed={() => setReplayQuery(undefined)}
          />
        </div>
      </section>

      <aside className="hidden min-h-0 w-72 shrink-0 flex-col gap-4 overflow-hidden lg:flex">
        <div className="dashboard-card flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4">
            <SchemaPreview uploadData={uploadData} />
          </div>
        </div>
        <div className="dashboard-card flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4">
            <MetricEditor />
          </div>
        </div>
      </aside>
    </main>
    </QueryLibraryProvider>
  );
}
