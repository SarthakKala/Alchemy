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
      className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
        isDragging
          ? 'border-[#3ECF8E] bg-[#3ECF8E]/5'
          : 'border-zinc-700 hover:border-zinc-500'
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      {isLoading ? (
        <p className="text-[#3ECF8E]">Processing your file...</p>
      ) : (
        <>
          <p className="text-white text-lg mb-2">Drop your CSV here</p>
          <p className="text-zinc-500 text-sm mb-4">or</p>
          <label className="cursor-pointer bg-[#3ECF8E] text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#3ECF8E]/90 transition">
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
          {error && <p className="mt-4 text-red-400 text-sm">{error}</p>}
        </>
      )}
    </div>
  );
}
