"use client";
import * as React from "react";
import { CartesianGrid, Line, LineChart as RLineChart, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartConfig, ChartTooltipContent } from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";

type ChartPoint = { time: string; [key: string]: number | string };

export function TotalValueChart() {
  const [data, setData] = React.useState<ChartPoint[]>([]);
  const [keys, setKeys] = React.useState<string[]>([]);
  React.useEffect(() => {
    fetch("/api/series", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => {
        const series: Array<{ modelName: string; points: Array<{ time: string; value: number }> }> = j.series ?? [];
        const toSlug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        const table: Record<string, ChartPoint> = {};
        const keyOrder: string[] = [];
        for (const s of series) {
          const slug = toSlug(s.modelName);
          if (!keyOrder.includes(slug)) keyOrder.push(slug);
          for (const p of s.points) {
            if (!table[p.time]) table[p.time] = { time: p.time };
            (table[p.time] as any)[slug] = p.value;
          }
        }
        const rows = Object.values(table).sort((a, b) => (a.time as string).localeCompare(b.time as string));
        setData(rows);
        setKeys(keyOrder);
      })
      .catch(() => setData([]));
  }, []);

  // currency short formatter (e.g., 12.3k)
  const fmt = (n: number) => {
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}m`;
    if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}k`;
    return `$${n.toFixed(0)}`;
  };

  const config: ChartConfig = Object.fromEntries(
    keys.map((slug, i) => [slug, { label: slug.replace(/-/g, " "), color: `var(--chart-${((i % 5) + 1) as 1 | 2 | 3 | 4 | 5})` }])
  ) as ChartConfig;

  return (
    <Card id="account-chart">
      <CardHeader className="p-4 pb-0">
        <CardTitle className="text-sm">Total account value (24h)</CardTitle>
        <CardDescription>UTC hourly buckets • multiple models</CardDescription>
      </CardHeader>
      <CardContent className="p-3 pt-2">
        <div className="w-full overflow-x-auto">
          <ChartContainer config={config}>
            <ResponsiveContainer width="100%" height={500}>
              <RLineChart data={data} margin={{ left: 12, right: 12 }}>
                <CartesianGrid vertical={false} stroke="#ffffff14" />
                <YAxis tickLine={false} axisLine={false} width={46} tickFormatter={(v) => fmt(Number(v))} />
                <XAxis
                  dataKey="time"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(v) => new Date(v).getUTCHours().toString().padStart(2, "0") + ":00"}
                />
                <Tooltip cursor={false} content={<ChartTooltipContent />} />
                {keys.map((slug) => (
                  <Line key={slug} dataKey={slug} name={config[slug].label} type="monotone" strokeWidth={2} dot={false} stroke={`var(--color-${slug})`} />
                ))}
              </RLineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
      {/* <CardFooter className="text-xs text-muted-foreground">Data from latest snapshots; colors per model like legend in shadcn example.</CardFooter> */}
    </Card>
  );
}


