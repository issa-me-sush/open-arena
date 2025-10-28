"use client";
// Minimal shadcn-style chart helpers built on top of Recharts
import * as React from "react";
import { cn } from "@/lib/utils";

export type ChartConfig = Record<string, { label: string; color: string } >;

export function ChartContainer({ config, className, children }: { config: ChartConfig; className?: string; children: React.ReactNode }) {
  // expose CSS vars like --color-desktop etc based on config
  const styleVars = Object.fromEntries(
    Object.entries(config).map(([k, v]) => ["--color-" + k, v.color])
  ) as React.CSSProperties;
  return (
    <div className={cn("w-full", className)} style={styleVars}>
      {children}
    </div>
  );
}

export function ChartTooltip({ content, cursor = false }: { content: React.ReactElement; cursor?: boolean }) {
  // passthrough wrapper, Recharts Tooltip is provided by consumer via content prop
  // We keep API compatibility with shadcn example
  // Consumer should import Tooltip from recharts and use <Tooltip ... />
  return null;
}

export function ChartTooltipContent({ label, payload, active, hideLabel }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border bg-popover p-2 text-xs shadow-md">
      {!hideLabel && label ? <div className="mb-1 font-medium">{label}</div> : null}
      <div className="space-y-1">
        {payload.map((p: any) => (
          <div key={p.dataKey} className="flex items-center justify-between gap-4">
            <span className="truncate" style={{ color: p.stroke }}>{p.name || p.dataKey}</span>
            <span className="tabular-nums">{p.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}


