"use client";

import { truncateText } from "@/utils/formatters";

interface PreviewTableProps {
  headers: string[];
  rows: Record<string, string>[];
  maxDisplay?: number;
}

export function PreviewTable({
  headers,
  rows,
  maxDisplay = 100,
}: PreviewTableProps) {
  const displayRows = rows.slice(0, maxDisplay);
  const hasMore = rows.length > maxDisplay;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <h3 className="text-[0.9375rem] font-semibold text-text-primary">
            CSV Preview
          </h3>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[0.6875rem] font-semibold tracking-[0.02em] bg-accent-soft text-accent">
            {rows.length} row{rows.length !== 1 ? "s" : ""}
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[0.6875rem] font-semibold tracking-[0.02em] bg-accent-soft text-accent">
            {headers.length} column{headers.length !== 1 ? "s" : ""}
          </span>
        </div>

        {hasMore && (
          <span className="text-xs text-text-muted">
            Showing {maxDisplay} of {rows.length}
          </span>
        )}
      </div>

      <div className="overflow-auto max-h-[520px] rounded-lg border border-border bg-bg-secondary">
        <table className="w-full border-collapse text-[0.8125rem]">
          <thead>
            <tr>
              <th className="sticky top-0 z-10 bg-bg-tertiary text-text-secondary font-semibold uppercase text-[0.6875rem] tracking-[0.05em] px-3.5 py-2.5 text-left whitespace-nowrap border-b border-border w-[50px]">
                #
              </th>
              {headers.map((h) => (
                <th
                  key={h}
                  className="sticky top-0 z-10 bg-bg-tertiary text-text-secondary font-semibold uppercase text-[0.6875rem] tracking-[0.05em] px-3.5 py-2.5 text-left whitespace-nowrap border-b border-border"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayRows.map((row, i) => (
              <tr
                key={i}
                className="even:bg-bg-tertiary hover:bg-accent-soft group"
              >
                <td className="px-3.5 py-2 border-b border-border whitespace-nowrap text-text-muted font-medium">
                  {i + 1}
                </td>
                {headers.map((h) => (
                  <td
                    key={h}
                    title={row[h] ?? ""}
                    className="px-3.5 py-2 border-b border-border whitespace-nowrap max-w-[240px] overflow-hidden text-ellipsis text-text-primary"
                  >
                    {truncateText(row[h] ?? "", 60)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
