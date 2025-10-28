"use client";
import * as React from "react";
import { AccountSeries } from "@/lib/types";

type Props = {
  series: AccountSeries[];
  height?: number;
};

export function LineChart({ series, height = 280 }: Props) {
  const padding = { top: 16, right: 24, bottom: 28, left: 48 };
  const width = 900; // container will control real width
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  const allY = series.flatMap((s) => s.points.map((p) => p.y));
  const allX = series[0]?.points.map((p) => p.x) ?? [];
  const minY = Math.min(...allY);
  const maxY = Math.max(...allY);
  const xMax = Math.max(...allX);

  const xScale = (x: number) => (x / (xMax || 1)) * innerW + padding.left;
  const yScale = (y: number) =>
    padding.top + innerH - ((y - minY) / (maxY - minY || 1)) * innerH;

  const pathFor = (pts: { x: number; y: number }[]) => {
    return pts
      .map((p, i) => `${i === 0 ? "M" : "L"}${xScale(p.x)},${yScale(p.y)}`)
      .join(" ");
  };

  const yTicks = 4;
  const yVals = Array.from({ length: yTicks + 1 }, (_, i) =>
    minY + (i * (maxY - minY)) / yTicks
  );

  const [hoverX, setHoverX] = React.useState<number | null>(null);
  const [containerRect, setContainerRect] = React.useState<{ left: number; top: number } | null>(null);

  const onMouseMove: React.MouseEventHandler<SVGSVGElement> = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (!containerRect) setContainerRect({ left: rect.left, top: rect.top });
    const x = e.clientX - rect.left;
    const clamped = Math.max(padding.left, Math.min(width - padding.right, x));
    // invert scale to nearest index
    const ratio = (clamped - padding.left) / innerW;
    const xi = Math.round(ratio * (xMax || 0));
    setHoverX(xi);
  };

  const onLeave = () => setHoverX(null);

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" onMouseMove={onMouseMove} onMouseLeave={onLeave}>
        {/* grid */}
        {yVals.map((v, i) => (
          <g key={i}>
            <line
              x1={padding.left}
              x2={width - padding.right}
              y1={yScale(v)}
              y2={yScale(v)}
              className="stroke-border"
              strokeDasharray="4 4"
            />
            <text
              x={padding.left - 8}
              y={yScale(v)}
              textAnchor="end"
              dominantBaseline="middle"
              className="fill-muted-foreground text-[10px]"
            >
              {v.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </text>
          </g>
        ))}
        {/* series */}
        {series.map((s, idx) => (
          <g key={s.name + idx}>
            <path d={pathFor(s.points)} fill="none" stroke={s.color} strokeWidth={2} />
          </g>
        ))}
        {/* hover crosshair + tooltip */}
        {hoverX !== null && (
          <g>
            <line
              x1={xScale(hoverX)}
              x2={xScale(hoverX)}
              y1={padding.top}
              y2={height - padding.bottom}
              className="stroke-muted-foreground/40"
            />
            {series.map((s, i) => {
              const pt = s.points.find((p) => p.x === hoverX) ?? s.points[0];
              if (!pt) return null;
              return (
                <circle key={s.name + i} cx={xScale(pt.x)} cy={yScale(pt.y)} r={3} fill={s.color} />
              );
            })}
            {/* tooltip box */}
            <foreignObject x={Math.min(xScale(hoverX) + 8, width - 180)} y={padding.top} width="172" height="120">
              <div className="rounded-md border bg-background p-2 shadow-sm">
                <div className="text-[10px] text-muted-foreground">t = {hoverX}h</div>
                <div className="mt-1 space-y-1">
                  {series.map((s) => {
                    const pt = s.points.find((p) => p.x === hoverX) ?? s.points[0];
                    if (!pt) return null;
                    return (
                      <div key={s.name} className="flex items-center justify-between gap-3 text-[11px]">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
                          <span className="truncate">{s.name}</span>
                        </div>
                        <span>{pt.y.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </foreignObject>
          </g>
        )}
      </svg>
    </div>
  );
}


