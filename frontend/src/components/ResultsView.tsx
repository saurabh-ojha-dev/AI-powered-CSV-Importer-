"use client";

import { useState } from "react";
import { truncateText } from "@/utils/formatters";
import type { ImportResult } from "@/utils/api";

interface ResultsViewProps {
  result: ImportResult;
}

const CRM_FIELDS = [
  "name",
  "email",
  "country_code",
  "mobile_without_country_code",
  "company",
  "city",
  "state",
  "country",
  "crm_status",
  "data_source",
  "lead_owner",
  "created_at",
  "crm_note",
  "possession_time",
  "description",
] as const;

export function ResultsView({ result }: ResultsViewProps) {
  const [activeTab, setActiveTab] = useState<"imported" | "skipped">(
    "imported"
  );

  return (
    <div className="animate-fade-in">
      <div className="flex gap-0.5 bg-bg-tertiary rounded-lg p-1 mb-4 w-fit">
        <button
          id="tab-imported"
          className={`px-4.5 py-2 rounded-md text-[0.8125rem] font-medium cursor-pointer transition-all duration-200 border-none bg-transparent ${
            activeTab === "imported"
              ? "bg-bg-secondary text-accent shadow-sm"
              : "text-text-muted hover:text-text-primary"
          }`}
          onClick={() => setActiveTab("imported")}
        >
          Imported
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[0.6875rem] font-semibold tracking-[0.02em] bg-success-soft text-success ml-1.5">
            {result.stats.imported}
          </span>
        </button>
        <button
          id="tab-skipped"
          className={`px-4.5 py-2 rounded-md text-[0.8125rem] font-medium cursor-pointer transition-all duration-200 border-none bg-transparent ${
            activeTab === "skipped"
              ? "bg-bg-secondary text-accent shadow-sm"
              : "text-text-muted hover:text-text-primary"
          }`}
          onClick={() => setActiveTab("skipped")}
        >
          Skipped
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[0.6875rem] font-semibold tracking-[0.02em] bg-warning-soft text-warning ml-1.5">
            {result.stats.skipped}
          </span>
        </button>
      </div>

      {activeTab === "imported" && (
        <div className="overflow-auto max-h-[520px] rounded-lg border border-border bg-bg-secondary">
          {result.imported.length === 0 ? (
            <div className="p-10 text-center text-text-muted">
              No records were imported
            </div>
          ) : (
            <table className="w-full border-collapse text-[0.8125rem]">
              <thead>
                <tr>
                  <th className="sticky top-0 z-10 bg-bg-tertiary text-text-secondary font-semibold uppercase text-[0.6875rem] tracking-[0.05em] px-3.5 py-2.5 text-left whitespace-nowrap border-b border-border w-[50px]">
                    #
                  </th>
                  {CRM_FIELDS.map((f) => (
                    <th
                      key={f}
                      className="sticky top-0 z-10 bg-bg-tertiary text-text-secondary font-semibold uppercase text-[0.6875rem] tracking-[0.05em] px-3.5 py-2.5 text-left whitespace-nowrap border-b border-border"
                    >
                      {f.replace(/_/g, " ")}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.imported.map((row, i) => (
                  <tr
                    key={i}
                    className="even:bg-bg-tertiary hover:bg-accent-soft group"
                  >
                    <td className="px-3.5 py-2 border-b border-border whitespace-nowrap text-text-muted font-medium">
                      {i + 1}
                    </td>
                    {CRM_FIELDS.map((f) => {
                      const val = (row as Record<string, string>)[f] ?? "";
                      return (
                        <td
                          key={f}
                          title={val}
                          className="px-3.5 py-2 border-b border-border whitespace-nowrap max-w-[240px] overflow-hidden text-ellipsis text-text-primary"
                        >
                          {truncateText(val, 50)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === "skipped" && (
        <div className="overflow-auto max-h-[520px] rounded-lg border border-border bg-bg-secondary">
          {result.skipped.length === 0 ? (
            <div className="p-10 text-center text-text-muted">
              No records were skipped — all rows imported successfully!
            </div>
          ) : (
            <table className="w-full border-collapse text-[0.8125rem]">
              <thead>
                <tr>
                  <th className="sticky top-0 z-10 bg-bg-tertiary text-text-secondary font-semibold uppercase text-[0.6875rem] tracking-[0.05em] px-3.5 py-2.5 text-left whitespace-nowrap border-b border-border w-[60px]">
                    Row #
                  </th>
                  <th className="sticky top-0 z-10 bg-bg-tertiary text-text-secondary font-semibold uppercase text-[0.6875rem] tracking-[0.05em] px-3.5 py-2.5 text-left whitespace-nowrap border-b border-border">
                    Reason
                  </th>
                  <th className="sticky top-0 z-10 bg-bg-tertiary text-text-secondary font-semibold uppercase text-[0.6875rem] tracking-[0.05em] px-3.5 py-2.5 text-left whitespace-nowrap border-b border-border">
                    Original Data
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.skipped.map((item, i) => (
                  <tr
                    key={i}
                    className="even:bg-bg-tertiary hover:bg-accent-soft group"
                  >
                    <td className="px-3.5 py-2 border-b border-border whitespace-nowrap text-text-muted font-medium">
                      {item.originalIndex + 1}
                    </td>
                    <td className="px-3.5 py-2 border-b border-border whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[0.6875rem] font-semibold tracking-[0.02em] bg-danger-soft text-danger">
                        {item.reason}
                      </span>
                    </td>
                    <td
                      title={JSON.stringify(item.row)}
                      className="px-3.5 py-2 border-b border-border whitespace-nowrap max-w-[240px] overflow-hidden text-ellipsis text-text-primary"
                    >
                      {truncateText(
                        Object.values(item.row).filter(Boolean).join(", "),
                        120
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
