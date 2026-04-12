'use client';

import { useCallback, useState } from 'react';
import { runQuery } from '@/lib/api';
import type { QueryResponse } from '@/lib/types';

export function useQuery(
  sessionId: string,
  tableName: string
) {
  const [loading, setLoading] = useState(false);

  const ask = useCallback(
    async (
      userQuery: string,
      clarificationResolved = false,
      resolvedQuery?: string
    ): Promise<QueryResponse> => {
      setLoading(true);
      try {
        return await runQuery(
          sessionId,
          tableName,
          userQuery,
          clarificationResolved,
          resolvedQuery
        );
      } finally {
        setLoading(false);
      }
    },
    [sessionId, tableName]
  );

  return { ask, loading };
}
