const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

interface ImportPayload {
  rows: Record<string, string>[];
  headers: string[];
}

interface ImportStats {
  total: number;
  imported: number;
  skipped: number;
}

interface SkippedRow {
  originalIndex: number;
  row: Record<string, string>;
  reason: string;
}

export interface ImportResult {
  imported: Record<string, string>[];
  skipped: SkippedRow[];
  stats: ImportStats;
}

export async function postImport(payload: ImportPayload): Promise<ImportResult> {
  const res = await fetch(`${API_BASE}/api/import`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Import failed (${res.status})`);
  }

  return res.json();
}
