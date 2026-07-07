"use client";

import { useState, useCallback } from "react";
import { postImport, type ImportResult } from "@/utils/api";

interface UseImportReturn {
  result: ImportResult | null;
  isLoading: boolean;
  error: string | null;
  triggerImport: (rows: Record<string, string>[], headers: string[]) => Promise<void>;
  reset: () => void;
}

export function useImport(): UseImportReturn {
  const [result, setResult] = useState<ImportResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const triggerImport = useCallback(
    async (rows: Record<string, string>[], headers: string[]) => {
      setIsLoading(true);
      setError(null);
      setResult(null);

      try {
        const response = await postImport({ rows, headers });
        setResult(response);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Something went wrong";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { result, isLoading, error, triggerImport, reset };
}
