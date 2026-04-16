'use client';

import { useCallback, useState } from 'react';
import { uploadCSV } from '@/lib/api';
import type { UploadResponse } from '@/lib/types';

interface Props {
  onUploadComplete: (data: UploadResponse) => void;
}

export function UploadZone({ onUploadComplete }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.name.endsWith('.csv')) {
        setError('Please upload a .csv file.');
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const data = await uploadCSV(file);
        onUploadComplete(data);
      } catch (e) {
        setError(
          e instanceof Error
            ? e.message
            : 'Upload failed. Please check your file and try again.'
        );
      } finally {
        setIsLoading(false);
      }
    },
    [onUploadComplete]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) void handleFile(file);
    },
    [handleFile]
  );

  return (
    <div
      className="text-center transition-all"
      style={{
        border: `2px dashed ${isDragging ? 'var(--orange-bright)' : 'var(--border-default)'}`,
        background: isDragging ? '#C25A1808' : 'transparent',
        borderRadius: '12px',
        padding: '48px 32px',
        transition: 'all 0.2s ease',
        boxShadow: isDragging ? '0 0 24px #C25A1820' : 'none',
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      {isLoading ? (
        <p style={{ color: 'var(--orange-bright)' }}>Processing your file...</p>
      ) : (
        <>
          <p
            style={{
              color: 'var(--text-primary)',
              fontSize: '16px',
              fontFamily: 'var(--font-display)',
              fontWeight: 600,
              marginBottom: '8px',
            }}
          >
            Drop your CSV here
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px' }}>or</p>
          <label className="btn-orange cursor-pointer rounded-xl px-5 py-2.5 text-sm">
            Browse file
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void handleFile(f);
              }}
            />
          </label>
          {error && (
            <p className="mt-4 text-sm" style={{ color: '#F87171' }}>
              {error}
            </p>
          )}
        </>
      )}
    </div>
  );
}
