'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { getLibrary } from '@/lib/api';
import type { SavedQuery } from '@/lib/types';

type QueryLibraryContextValue = {
  entries: SavedQuery[];
  ready: boolean;
  refresh: () => Promise<void>;
};

const QueryLibraryContext = createContext<QueryLibraryContextValue | null>(null);

export function QueryLibraryProvider({
  sessionId,
  children,
}: {
  sessionId: string;
  children: ReactNode;
}) {
  const [entries, setEntries] = useState<SavedQuery[]>([]);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const list = await getLibrary(sessionId);
      setEntries(list);
    } catch {
      setEntries([]);
    }
  }, [sessionId]);

  useEffect(() => {
    let cancelled = false;
    setReady(false);
    void (async () => {
      try {
        const list = await getLibrary(sessionId);
        if (!cancelled) setEntries(list);
      } catch {
        if (!cancelled) setEntries([]);
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  const value = useMemo(
    () => ({ entries, ready, refresh }),
    [entries, ready, refresh]
  );

  return (
    <QueryLibraryContext.Provider value={value}>{children}</QueryLibraryContext.Provider>
  );
}

export function useQueryLibrary(): QueryLibraryContextValue {
  const ctx = useContext(QueryLibraryContext);
  if (!ctx) {
    throw new Error('useQueryLibrary must be used within QueryLibraryProvider');
  }
  return ctx;
}
