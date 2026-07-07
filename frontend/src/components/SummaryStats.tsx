"use client";

import { useEffect, useState } from "react";
import { formatNumber } from "@/utils/formatters";

interface SummaryStatsProps {
  total: number;
  imported: number;
  skipped: number;
}

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (value === 0) {
      setDisplay(0);
      return;
    }

    const duration = 800;
    const steps = 30;
    const increment = value / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(Math.round(increment * step), value);
      setDisplay(current);

      if (step >= steps) clearInterval(timer);
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return <>{formatNumber(display)}</>;
}

export function SummaryStats({ total, imported, skipped }: SummaryStatsProps) {
  const cards = [
    {
      label: "Total Rows",
      value: total,
      color: "var(--accent)",
      bg: "var(--accent-soft)",
    },
    {
      label: "Successfully Imported",
      value: imported,
      color: "var(--success)",
      bg: "var(--success-soft)",
    },
    {
      label: "Skipped",
      value: skipped,
      color: "var(--warning)",
      bg: "var(--warning-soft)",
    },
  ];

  return (
    <div className="animate-fade-in grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4">
      {cards.map((card) => (
        <div
          className="p-5 px-6 rounded-xl bg-bg-secondary border border-border transition-all duration-200 hover:-translate-y-[2px] hover:shadow-lg"
          key={card.label}
        >
          <div
            className="text-[2rem] font-bold leading-none mb-1"
            style={{ color: card.color }}
          >
            <AnimatedNumber value={card.value} />
          </div>
          <div className="text-xs uppercase tracking-[0.06em] text-text-muted font-medium">
            {card.label}
          </div>
        </div>
      ))}
    </div>
  );
}
