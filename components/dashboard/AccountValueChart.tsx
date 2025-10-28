import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart } from "@/components/charts/LineChart";
import { AccountSeries } from "@/lib/types";

export function AccountValueChart({ series, height = 340, containerId }: { series: AccountSeries[]; height?: number; containerId?: string }) {
  return (
    <Card id={containerId} className="bg-card card-accent-blue">
      <CardHeader className="p-4 pb-0">
        <CardTitle className="text-sm">Total account value</CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-2">
        <LineChart series={series} height={height} />
        <div className="mt-3 flex flex-wrap gap-3 text-[11px]">
          {series.map((s) => (
            <div key={s.name} className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
              <span>{s.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}


