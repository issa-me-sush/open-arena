import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, TrendingUp, TrendingDown } from "lucide-react";
import { connectMongo } from "@/src/db";
import { AiModel, LeaderboardSnapshot, ModelInference } from "@/src/models";

type Props = {
  params: Promise<{ slug: string }>;
};

function formatUsd(n: number) {
  return n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function ModelDetailPage({ params }: Props) {
  const { slug } = await params;

  // Helper to normalize model names to slugs
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
  const toSlug = (name: string) => nameToSlug[name] || name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  // Connect to DB
  const uri = process.env.MONGO_URI;
  if (!uri) {
    notFound();
  }
  await connectMongo(uri);

  // Find model by slug from DB
  const models = await AiModel.find({}).select({ name: 1, wallet_address: 1 }).lean();
  const modelDoc = (models as any[]).find((m: any) => toSlug(m.name) === slug);
  if (!modelDoc) {
    notFound();
  }

  const modelName: string = (modelDoc as any).name;
  const modelWallet: string = (modelDoc as any).wallet_address;
  const modelId: string = String((modelDoc as any)._id ?? "");
  const needsWhite = slug === "gpt-5" || slug === "grok-4";

  // Get latest 2 snapshots for this model
  const snapshots = await LeaderboardSnapshot.find({ model_id: (modelDoc as any)._id })
    .sort({ date: -1 })
    .limit(2)
    .lean();
  const latest = (snapshots as any[])?.[0];
  const previous = (snapshots as any[])?.[1];
  const latestTotal: number = Number((latest as any)?.total_value ?? (latest as any)?.portfolio_value ?? 0);
  const prevTotal: number = Number((previous as any)?.total_value ?? (previous as any)?.portfolio_value ?? 0);
  const pnl24h = latest && previous ? latestTotal - prevTotal : 0;
  const pnlPositive = pnl24h >= 0;

  // Fetch live and closed positions for this model wallet from Polymarket
  const sizeThreshold = 1;
  const liveUrl = `https://data-api.polymarket.com/positions?sizeThreshold=${encodeURIComponent(String(sizeThreshold))}&limit=100&offset=0&sortBy=TOKENS&sortDirection=DESC&user=${encodeURIComponent(
    modelWallet
  )}`;
  const closedUrl = `https://data-api.polymarket.com/closed-positions?limit=100&offset=0&sortBy=REALIZEDPNL&sortDirection=DESC&user=${encodeURIComponent(
    modelWallet
  )}`;
  const [liveR, closedR] = await Promise.all([fetch(liveUrl, { cache: "no-store" }), fetch(closedUrl, { cache: "no-store" })]);
  const liveItems: any[] = liveR.ok ? await liveR.json() : [];
  const closedItems: any[] = closedR.ok ? await closedR.json() : [];

  const allLive: any[] = (liveItems ?? []).filter((p: any) => {
    const size = Number(p.size ?? p.totalBought ?? 0);
    const cur = Number(p.curPrice ?? 0);
    const redeemable = Boolean(p.redeemable);
    return size > 0 && !redeemable && cur > 0;
  });
  const allClosed: any[] = closedItems ?? [];

  const totalTrades = allLive.length + allClosed.length;
  const openTrades = allLive.length;
  const closedTrades = allClosed.length;
  const avgTradeSize = totalTrades > 0
    ? ([...allLive, ...allClosed].reduce((sum, p: any) => sum + Number(p.size ?? p.totalBought ?? 0) * Number(p.avgPrice ?? 0), 0) / totalTrades)
    : 0;

  // Load recent inferences for this model
  const infDocs = await ModelInference.find({ model_id: (modelDoc as any)._id })
    .sort({ timestamp: -1 })
    .limit(50)
    .lean();
  const modelInferences: Array<{ id: string; timestamp: string; prompt: string; reasoning?: string }> = (infDocs as any[]).map(
    (d: any) => ({ id: String(d._id), timestamp: d.timestamp, prompt: d.prompt, reasoning: d.reasoning || "" })
  );

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto w-full max-w-[1200px] px-4 py-8">
        {/* Back button */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        {/* Model header */}
        <div className="flex items-start gap-6 mb-8">
          <Image
            src={`/models/${slug}.svg`}
            alt={modelName}
            width={80}
            height={80}
            className={"rounded-lg " + (needsWhite ? "dark:brightness-0 dark:invert" : "")}
          />
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{modelName}</h1>
            <p className="text-muted-foreground">AI model trading in the Open Arena</p>
          </div>
        </div>

        {/* Stats overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatUsd(latestTotal)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                24h P&L
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <span className={`text-2xl font-bold ${pnlPositive ? "text-green-500" : "text-red-500"}`}>
                  {pnlPositive ? "+" : ""}{formatUsd(Math.abs(pnl24h))}
                </span>
                {pnlPositive ? (
                  <TrendingUp className="h-5 w-5 text-green-500" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-500" />
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Positions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTrades}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {openTrades} open, {closedTrades} closed
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Avg Position Size
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatUsd(avgTradeSize)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Live Positions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Live Positions</CardTitle>
          </CardHeader>
          <CardContent>
            {allLive.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No live positions</p>
            ) : (
              <ul className="space-y-2">
                {allLive.map((p) => (
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
                    <div className="mt-1 text-[11px] text-muted-foreground">Size {p.size ?? p.totalBought} @ {Number(p.avgPrice).toFixed(2)}</div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Recently Closed */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Recently Closed</CardTitle>
          </CardHeader>
          <CardContent>
            {allClosed.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No closed positions</p>
            ) : (
              <ul className="space-y-2">
                {allClosed.map((p) => (
                  <li key={`${p.asset}-${p.endDate}`} className="rounded-md border p-2 text-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        {p.icon ? <img src={p.icon} alt="icon" className="h-4 w-4 rounded" /> : null}
                        <a href={`https://polymarket.com/event/${p.eventSlug || p.slug}`} target="_blank" rel="noreferrer" className="truncate font-medium hover:underline">{p.title}</a>
                      </div>
                      <span className={Number(p.realizedPnl) >= 0 ? "text-emerald-500" : "text-red-500"}>
                        {Number(p.realizedPnl) >= 0 ? "+" : ""}{Number(p.realizedPnl).toFixed(2)} PnL
                      </span>
                    </div>
                    <div className="mt-1 text-[11px] text-muted-foreground">Bought {p.totalBought} @ {Number(p.avgPrice).toFixed(2)}</div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Recent Inferences */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Inferences</CardTitle>
          </CardHeader>
          <CardContent>
            {modelInferences.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No inferences yet</p>
            ) : (
              <div className="space-y-4">
                {modelInferences.map((inference) => {
                  const preview = (inference.reasoning || inference.prompt || "").slice(0, 200);
                  return (
                    <div key={inference.id} className="border-b pb-4 last:border-0">
                      <div className="text-sm text-muted-foreground mb-2">
                        {formatDate(inference.timestamp)}
                      </div>
                      <p className="text-sm leading-relaxed">{preview}{(inference.reasoning || inference.prompt || "").length > 200 ? "…" : ""}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

