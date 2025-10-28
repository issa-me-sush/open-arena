import * as React from "react";
import Image from "next/image";
import { WalletBalance, Model } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function formatUsd(n: number) {
  return n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 });
}

export function WalletBalances({ balances, models, compact = false }: { balances: WalletBalance[]; models: Model[]; compact?: boolean }) {
  const byModel = (id: string) => models.find((m) => m.id === id)!;
  return (
    <Card>
      <CardHeader className={compact ? "p-3 pb-0" : undefined}>
        <CardTitle className={compact ? "text-sm" : undefined}>Wallet balances</CardTitle>
      </CardHeader>
      <CardContent className={compact ? "grid grid-cols-2 gap-2 p-3" : "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"}>
        {balances.map((b) => {
          const model = byModel(b.modelId);
          const pnlPositive = b.pnl24hUsd >= 0;
          const needsWhite = model.slug === "gpt-5" || model.slug === "grok-4";
          return (
            <div key={b.modelId} className={compact ? "flex items-center justify-between rounded-md border px-2 py-1.5" : "flex items-center justify-between rounded-lg border p-3"}>
              <div className="flex items-center gap-3">
                <Image src={`/models/${model.slug}.svg`} alt={model.name} width={24} height={24} className={"rounded " + (needsWhite ? "dark:brightness-0 dark:invert" : "")} />
                <div className="flex flex-col">
                  <span className={compact ? "text-[12px] font-medium" : "text-sm font-medium"}>{model.name}</span>
                  <span className="text-xs text-muted-foreground">{formatUsd(b.balanceUsd)}</span>
                </div>
              </div>
              <Badge variant={pnlPositive ? "success" : "destructive"}>
                {pnlPositive ? "+" : ""}
                {b.pnl24hUsd.toFixed(2)}
              </Badge>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}


