'use client';

import { useEffect, useState } from 'react';
import { getMetrics, saveMetrics } from '@/lib/api';
import type { MetricsStore } from '@/lib/types';

export function MetricEditor() {
  const [metrics, setMetrics] = useState<MetricsStore>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getMetrics()
      .then(setMetrics)
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveMetrics(metrics);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const updateDefinition = (key: string, value: string) => {
    setMetrics((prev) => ({
      ...prev,
      [key]: { ...prev[key], definition: value },
    }));
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Metric Definitions</h3>
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={saving}
          className="text-xs text-orange-400 hover:underline disabled:opacity-50"
        >
          {saved ? 'Saved' : saving ? 'Saving...' : 'Save'}
        </button>
      </div>
      <p className="text-zinc-500 text-xs mb-3">
        Define what your column names mean. The AI uses these for every query.
      </p>
      <div className="space-y-3">
        {Object.entries(metrics).map(([key, val]) => (
          <div key={key}>
            <p className="text-zinc-400 text-xs mb-1 font-mono">{key}</p>
            <input
              value={val.definition}
              onChange={(e) => updateDefinition(key, e.target.value)}
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-overlay)] px-2.5 py-2 text-xs text-white outline-none focus:border-orange-400"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
