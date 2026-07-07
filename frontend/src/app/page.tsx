"use client";

import { useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { FileDropzone } from "@/components/FileDropzone";
import { PreviewTable } from "@/components/PreviewTable";
import { ProgressOverlay } from "@/components/ProgressOverlay";
import { SummaryStats } from "@/components/SummaryStats";
import { ResultsView } from "@/components/ResultsView";
import { useCsvParser } from "@/hooks/useCsvParser";
import { useImport } from "@/hooks/useImport";

type Step = "upload" | "preview" | "processing" | "results";

export default function HomePage() {
  const [step, setStep] = useState<Step>("upload");
  const csv = useCsvParser();
  const importer = useImport();

  const handleFileSelected = (file: File) => {
    csv.parseFile(file);
    importer.reset();
  };

  // transition to preview once parsing finishes
  if (csv.result && step === "upload") {
    setStep("preview");
  }

  const handleConfirmImport = async () => {
    if (!csv.result) return;

    setStep("processing");
    await importer.triggerImport(csv.result.data, csv.result.headers);
    setStep("results");
  };

  const handleStartOver = () => {
    csv.reset();
    importer.reset();
    setStep("upload");
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg-primary text-text-primary transition-colors duration-200">
      {/* ── Header ── */}
      <header className="flex items-center justify-between px-8 py-4 border-b border-border bg-bg-secondary transition-colors duration-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-purple-400 flex items-center justify-center">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
          </div>
          <span className="font-bold text-[1.0625rem] text-text-primary">
            CSV Importer
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[0.6875rem] font-semibold tracking-[0.02em] bg-accent-soft text-accent">
            AI-Powered
          </span>
        </div>
        <ThemeToggle />
      </header>

      {/* ── Main ── */}
      <main className="flex-1 w-full max-w-[1100px] mx-auto px-6 py-8">
        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-7">
          {(["upload", "preview", "processing", "results"] as Step[]).map(
            (s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors duration-200 ${
                    step === s
                      ? "bg-accent text-white"
                      : i < ["upload", "preview", "processing", "results"].indexOf(step)
                      ? "bg-success text-white"
                      : "bg-bg-tertiary text-text-muted"
                  }`}
                >
                  {i < ["upload", "preview", "processing", "results"].indexOf(step) ? "✓" : i + 1}
                </div>
                <span
                  className={`text-[0.8125rem] capitalize ${
                    step === s
                      ? "font-semibold text-text-primary"
                      : "font-normal text-text-muted"
                  }`}
                >
                  {s}
                </span>
                {i < 3 && (
                  <div
                    className={`w-10 h-0.5 rounded-[1px] ${
                      i < ["upload", "preview", "processing", "results"].indexOf(step)
                        ? "bg-success"
                        : "bg-border"
                    }`}
                  />
                )}
              </div>
            )
          )}
        </div>

        {/* Content card */}
        <div
          className={`bg-bg-secondary border border-border rounded-xl shadow-md transition-all duration-200 hover:shadow-lg hover:border-border-hover ${
            step === "upload" ? "p-0" : "p-6"
          }`}
        >
          {/* ── Upload Step ── */}
          {step === "upload" && (
            <div className="p-6">
              <FileDropzone
                onFileSelected={handleFileSelected}
                disabled={csv.isParsing}
              />
              {csv.error && (
                <div className="animate-fade-in mt-4 px-4 py-3 rounded-lg bg-danger-soft text-danger text-[0.8125rem]">
                  {csv.error}
                </div>
              )}
              {csv.isParsing && (
                <div className="mt-4 text-center text-text-muted text-[0.875rem]">
                  Parsing CSV…
                </div>
              )}
            </div>
          )}

          {/* ── Preview Step ── */}
          {step === "preview" && csv.result && (
            <>
              <div className="flex flex-wrap items-center justify-between mb-5 gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-text-primary mb-1">
                    Review Your Data
                  </h2>
                  <p className="text-[0.8125rem] text-text-muted">
                    {csv.result.fileName} • {csv.result.rowCount} rows •{" "}
                    {csv.result.headers.length} columns
                  </p>
                </div>
                <div className="flex gap-2.5">
                  <button
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-[0.875rem] transition-colors duration-200 border border-border bg-transparent text-text-secondary hover:bg-bg-tertiary hover:border-border-hover disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleStartOver}
                  >
                    ← Back
                  </button>
                  <button
                    id="confirm-import"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-[0.875rem] transition-all duration-200 border-none bg-accent text-white hover:bg-accent-hover hover:-translate-y-[1px] hover:shadow-[0_4px_12px_rgba(99,102,241,0.35)] disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleConfirmImport}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    Confirm Import
                  </button>
                </div>
              </div>
              <PreviewTable
                headers={csv.result.headers}
                rows={csv.result.data}
              />
            </>
          )}

          {/* ── Processing Step ── */}
          {step === "processing" && <ProgressOverlay />}

          {/* ── Results Step ── */}
          {step === "results" && (
            <>
              {importer.error && (
                <div className="animate-fade-in mb-5 px-[18px] py-[14px] rounded-lg bg-danger-soft text-danger text-[0.875rem]">
                  <strong>Error:</strong> {importer.error}
                </div>
              )}

              {importer.result && (
                <div>
                  <div className="flex flex-wrap items-center justify-between mb-5 gap-3">
                    <h2 className="text-lg font-semibold text-text-primary">
                      Import Complete
                    </h2>
                    <button
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-[0.875rem] transition-colors duration-200 border border-border bg-transparent text-text-secondary hover:bg-bg-tertiary hover:border-border-hover"
                      onClick={handleStartOver}
                    >
                      ↻ Import Another File
                    </button>
                  </div>

                  <SummaryStats
                    total={importer.result.stats.total}
                    imported={importer.result.stats.imported}
                    skipped={importer.result.stats.skipped}
                  />

                  <div className="mt-6">
                    <ResultsView result={importer.result} />
                  </div>
                </div>
              )}

              {!importer.result && !importer.error && (
                <div className="p-10 text-center">
                  <p className="text-text-muted">
                    Something went wrong. Please try again.
                  </p>
                  <button
                    className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-[0.875rem] transition-all duration-200 border-none bg-accent text-white hover:bg-accent-hover hover:-translate-y-[1px] hover:shadow-[0_4px_12px_rgba(99,102,241,0.35)]"
                    onClick={handleStartOver}
                  >
                    Start Over
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="px-8 py-4 border-t border-border text-center text-xs text-text-muted transition-colors duration-200">
        AI-Powered CSV Importer • Built with Next.js, Express & Gemini
      </footer>
    </div>
  );
}
