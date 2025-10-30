"use client";
import * as React from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";

function formatUsd(n: number) {
  return n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 });
}

function formatQty(n: number) {
  return n.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 0 });
}

type Snapshot = {
  id: string;
  date: string;
  total_value: number;
  portfolio_value?: number;
  top_positions: string[];
};

type ModelEntry = {
  modelId: string;
  modelName: string;
  wallet: string;
  snapshots: Snapshot[];
};

const nameToSlug: Record<string, string> = {
  "GPT 5": "gpt-5",
  "Grok 4": "grok-4",
  "Claude Sonnet 4.5": "sonnet-4-5",
  "Gemini 2.5 Pro": "gemini-2-5",
  "Gemini 2.5 Flash": "gemini-2-5",
  "DeepSeek Chat v3.1": "deepseek-v3-1",
  "deepseek-chat-v3.1": "deepseek-v3-1",
  "Qwen3 Max": "qwen3-max",
  "qwen3-max": "qwen3-max",
};

export function LivePositions() {
  const [models, setModels] = React.useState<any[]>([]);
  React.useEffect(() => {
    fetch("/api/live-positions", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => setModels(j.models ?? []))
      .catch(() => setModels([]));
  }, []);

  return (
    <div className="space-y-3">
      {models.map((m) => (
        <LivePositionsCard key={m.wallet} model={m} />
      ))}
    </div>
  );
}

export function CompletedPositions() {
  const [models, setModels] = React.useState<any[]>([]);
  const [limit] = React.useState(50);
  React.useEffect(() => {
    fetch(`/api/closed-positions?limit=${limit}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => setModels(j.models ?? []))
      .catch(() => setModels([]));
  }, []);

  return (
    <div className="space-y-3">
      {models.map((m) => (
        <ClosedPositionsCard key={m.wallet} model={m} />
      ))}
    </div>
  );
}

function ModelPositions({ entry, mode }: { entry: ModelEntry; mode: "live" | "completed" }) {
  const slug = nameToSlug[entry.modelName] || entry.modelName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const needsWhite = slug === "gpt-5" || slug === "grok-4";
  const latest = entry.snapshots?.[0];
  const previous = entry.snapshots?.[1];
  const latestSet = new Set((latest?.top_positions ?? []).map((s) => s.trim()));
  let list: string[] = [];
  if (mode === "live") {
    list = Array.from(latestSet);
  } else {
    const prev = previous?.top_positions ?? [];
    list = prev.filter((p) => !latestSet.has(p.trim()));
  }

  if (!list.length) return null;

  return (
    <Card>
      <CardContent className="p-3">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src={`/models/${slug}.svg`} alt={entry.modelName} width={18} height={18} className={needsWhite ? "dark:brightness-0 dark:invert" : ""} />
            <span className="text-sm font-medium">{entry.modelName}</span>
          </div>
          {latest ? (
            <span className="text-xs text-muted-foreground">Total: ${(latest.total_value ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
          ) : null}
        </div>
        <ul className="text-sm text-muted-foreground list-disc pl-5">
          {list.slice(0, 5).map((p) => (
            <li key={p} className="truncate">{p}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
function LivePositionsCard({ model }: { model: any }) {
  const slug = nameToSlug[model.modelName] || model.modelName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const needsWhite = slug === "gpt-5" || slug === "grok-4";
  // Only show truly live positions (non-redeemable, positive size, non-zero current price)
  const list: any[] = (model.positions ?? []).filter((p: any) => {
    const size = Number(p.size ?? p.totalBought ?? 0);
    const cur = Number(p.curPrice ?? 0);
    const redeemable = Boolean(p.redeemable);
    return size > 0 && !redeemable && cur > 0;
  });
  if (!list.length) return null;
  return (
    <Card>
      <CardContent className="p-3">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src={`/models/${slug}.svg`} alt={model.modelName} width={18} height={18} className={needsWhite ? "dark:brightness-0 dark:invert" : ""} />
            <span className="text-sm font-medium">{model.modelName}</span>
          </div>
          <a href={`https://polymarket.com/@${model.wallet}`} target="_blank" rel="noreferrer" className="text-xs text-muted-foreground hover:underline">Wallet: {model.wallet.slice(0, 6)}…{model.wallet.slice(-4)}</a>
        </div>
        <ul className="space-y-2 max-h-64 overflow-auto pr-1">
          {list.map((p) => (
            <li key={`${p.asset}-${p.eventSlug || p.slug}`} className="rounded-md border p-2 text-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {p.icon ? <img src={p.icon} alt="icon" className="h-4 w-4 rounded" /> : null}
                  <a href={`https://polymarket.com/event/${p.eventSlug || p.slug}`} target="_blank" rel="noreferrer" className="truncate font-medium hover:underline">
                    {p.title}
                  </a>
                </div>
                <span className={(Number(p.percentPnl ?? ((p.currentValue - p.initialValue) / Math.max(p.initialValue, 1e-8) * 100)) >= 0) ? "text-emerald-500" : "text-red-500"}>
                  {Number(p.percentPnl ?? 0) >= 0 ? "+" : ""}
                  {Number(p.percentPnl ?? ((p.currentValue - p.initialValue) / Math.max(p.initialValue, 1e-8) * 100)).toFixed(2)}%
                </span>
              </div>
              {(() => {
                const size = Number(p.size ?? p.totalBought ?? 0);
                const price = Number(p.avgPrice ?? p.curPrice ?? 0);
                const rawSide = (p.side || p.outcome || p.outcomeName || p.direction || "").toString();
                const side = rawSide ? String(rawSide).toLowerCase() : "";
                return (
                  <div className="mt-1 text-[11px] text-muted-foreground">
                    {formatQty(size)}{side ? ` ${side}` : ""} at ${price.toFixed(2)}
                  </div>
                );
              })()}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function ClosedPositionsCard({ model }: { model: any }) {
  const slug = nameToSlug[model.modelName] || model.modelName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const needsWhite = slug === "gpt-5" || slug === "grok-4";
  const list: any[] = model.positions ?? [];
  if (!list.length) return null;
  return (
    <Card>
      <CardContent className="p-3">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src={`/models/${slug}.svg`} alt={model.modelName} width={18} height={18} className={needsWhite ? "dark:brightness-0 dark:invert" : ""} />
            <span className="text-sm font-medium">{model.modelName}</span>
          </div>
          <a href={`https://polymarket.com/@${model.wallet}`} target="_blank" rel="noreferrer" className="text-xs text-muted-foreground hover:underline">Wallet: {model.wallet.slice(0, 6)}…{model.wallet.slice(-4)}</a>
        </div>
        <ul className="space-y-2 max-h-64 overflow-auto pr-1">
          {list.map((p) => (
            <li key={`${p.asset}-${p.endDate}`} className="rounded-md border p-2 text-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {p.icon ? <img src={p.icon} alt="icon" className="h-4 w-4 rounded" /> : null}
                  <a href={`https://polymarket.com/event/${p.eventSlug || p.slug}`} target="_blank" rel="noreferrer" className="truncate font-medium hover:underline">{p.title}</a>
                </div>
                <span className={p.realizedPnl >= 0 ? "text-emerald-500" : "text-red-500"}>
                  {p.realizedPnl >= 0 ? "+" : ""}{p.realizedPnl.toFixed(2)} PnL
                </span>
              </div>
              {(() => {
                const size = Number(p.totalBought ?? p.size ?? 0);
                const price = Number(p.avgPrice ?? 0);
                const rawSide = (p.side || p.outcome || p.outcomeName || p.direction || "").toString();
                const side = rawSide ? String(rawSide).toLowerCase() : "";
                return (
                  <div className="mt-1 text-[11px] text-muted-foreground">
                    {formatQty(size)}{side ? ` ${side}` : ""} at ${price.toFixed(2)}
                  </div>
                );
              })()}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}


