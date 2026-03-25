import { useEffect, useState, useCallback, useRef } from 'react';

interface UsePollingResult<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  refetch: () => void;
}

export function usePolling<T>(
  fetchFn: () => Promise<T>,
  intervalMs: number,
  enabled = true
): UsePollingResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const fetchRef = useRef(fetchFn);
  fetchRef.current = fetchFn;

  const refetch = useCallback(async () => {
    try {
      const result = await fetchRef.current();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    refetch();
    const id = setInterval(refetch, intervalMs);
    return () => clearInterval(id);
  }, [enabled, intervalMs, refetch]);

  return { data, error, isLoading, refetch };
}
