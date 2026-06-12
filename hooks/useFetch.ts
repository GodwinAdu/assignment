'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface UseFetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  skip?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

async function refreshAccessToken(): Promise<boolean> {
  try {
    const res = await window.fetch('/api/auth/refresh', { method: 'POST' });
    return res.ok;
  } catch {
    return false;
  }
}

export function useFetch<T = any>(
  url: string,
  options: UseFetchOptions = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(!options.skip);

  // Store options in a ref to avoid re-render loops
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const fetchData = useCallback(async (overrideBody?: any) => {
    const opts = optionsRef.current;
    try {
      setLoading(true);
      setError(null);

      const makeRequest = async () => {
        return window.fetch(url, {
          method: opts.method || 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...opts.headers,
          },
          ...(overrideBody || opts.body ? { body: JSON.stringify(overrideBody || opts.body) } : {}),
        });
      };

      let response = await makeRequest();

      // If 401, try to refresh the token and retry once
      if (response.status === 401) {
        const refreshed = await refreshAccessToken();
        if (refreshed) {
          // Retry the original request with the new token
          response = await makeRequest();
        } else {
          // Refresh failed — redirect to login
          window.location.href = '/auth/login';
          throw new Error('Session expired. Please log in again.');
        }
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Request failed');
      }

      const result = await response.json();
      setData(result);
      opts.onSuccess?.(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      opts.onError?.(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    if (optionsRef.current.skip) return;

    const method = optionsRef.current.method;
    if (method === 'GET' || !method) {
      fetchData();
    }
  }, [url, fetchData]);

  return { data, error, loading, fetch: fetchData };
}
