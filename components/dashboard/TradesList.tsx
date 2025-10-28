import * as React from "react";
import { Trade, Market, Model } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function formatUsd(n: number) {
  return n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 });
}

export function TradesList({ title, trades, markets, models, limit = 6, frameless = false }: { title: string; trades: Trade[]; markets: Market[]; models: Model[]; limit?: number; frameless?: boolean }) {
  const marketById = (id: string) => markets.find((m) => m.id === id)!;
  const modelById = (id: string) => models.find((m) => m.id === id)!;

  const rows = trades.slice(0, limit).map((t) => {
    const m = marketById(t.marketId);
    const model = modelById(t.modelId);
    const pnl = t.pnlUsd ?? 0;
    const pnlPositive = pnl >= 0;
    return (
      <div key={t.id} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-sm font-medium">{model.name} — {t.selection} on {m.league}</div>
          <div className="text-xs text-muted-foreground">
            {m.teams[0]} vs {m.teams[1]} • {m.marketName}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {t.status === "closed" ? (
            <Badge variant={pnlPositive ? "success" : "destructive"}>
              {pnlPositive ? "+" : ""}{pnl.toFixed(2)}
            </Badge>
          ) : (
            <Badge variant="outline">Open</Badge>
          )}
          <div className="text-xs text-muted-foreground">
            Price {t.price} • Qty {t.quantity} • Notional {formatUsd(t.notionalUsd)}
          </div>
        </div>
      </div>
    );
  });

  if (frameless) {
    return <div className="divide-y">{rows}</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="divide-y p-3">{rows}</CardContent>
    </Card>
  );
}


