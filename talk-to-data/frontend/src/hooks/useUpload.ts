'use client';

import { useCallback, useState } from 'react';
import { uploadCSV } from '@/lib/api';
import type { UploadResponse } from '@/lib/types';

export function useUpload(onComplete: (data: UploadResponse) => void) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(
    async (file: File) => {
      setLoading(true);
      setError(null);
      try {
        const data = await uploadCSV(file);
        onComplete(data);
      } catch {
        setError('Upload failed. Please check your file and try again.');
      } finally {
        setLoading(false);
      }
    },
    [onComplete]
  );

  return { upload, loading, error };
}
