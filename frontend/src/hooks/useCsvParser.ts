"use client";

import { useState, useCallback } from "react";
import Papa from "papaparse";

interface CsvParseResult {
  data: Record<string, string>[];
  headers: string[];
  rowCount: number;
  fileName: string;
}

interface UseCsvParserReturn {
  result: CsvParseResult | null;
  error: string | null;
  isParsing: boolean;
  parseFile: (file: File) => void;
  reset: () => void;
}

export function useCsvParser(): UseCsvParserReturn {
  const [result, setResult] = useState<CsvParseResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);

  const parseFile = useCallback((file: File) => {
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setError("Please upload a .csv file");
      return;
    }

    setIsParsing(true);
    setError(null);

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: "greedy",
      transformHeader: (header) => header.trim(),
      complete: (parsed) => {
        if (parsed.errors.length > 0) {
          console.warn("[csv] Parse warnings:", parsed.errors.slice(0, 5));
        }

        const rows = parsed.data.filter((row) =>
          Object.values(row).some((val) => val?.trim())
        );

        if (rows.length === 0) {
          setError("The CSV file appears to be empty or has no valid rows");
          setIsParsing(false);
          return;
        }

        const headers = parsed.meta.fields ?? Object.keys(rows[0]);

        setResult({
          data: rows,
          headers,
          rowCount: rows.length,
          fileName: file.name,
        });
        setIsParsing(false);
      },
      error: (err) => {
        setError(`Failed to parse CSV: ${err.message}`);
        setIsParsing(false);
      },
    });
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { result, error, isParsing, parseFile, reset };
}
