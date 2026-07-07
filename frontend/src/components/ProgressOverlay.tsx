"use client";

interface ProgressOverlayProps {
  message?: string;
}

export function ProgressOverlay({
  message = "Processing your data with AI…",
}: ProgressOverlayProps) {
  return (
    <div
      id="progress-overlay"
      className="animate-fade-in flex flex-col items-center justify-center p-[80px_32px] text-center"
    >
      {/* spinner */}
      <div className="w-12 h-12 border-4 border-border border-t-accent rounded-full mb-6 animate-spin" />

      <p className="animate-pulse-soft text-[1.0625rem] font-medium text-text-primary mb-2">
        {message}
      </p>

      <p className="text-[0.8125rem] text-text-muted max-w-[400px]">
        Each batch of records is being mapped to CRM fields by the AI model.
        This may take a minute for larger files.
      </p>

      <div className="w-full max-w-[320px] mt-7">
        <div className="h-1.5 rounded-full bg-bg-tertiary overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-accent to-purple-400 animate-indeterminate" />
        </div>
      </div>
    </div>
  );
}
