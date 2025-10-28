import { AccountSeries, Inference, Market, Model, Trade, WalletBalance } from "@/lib/types";

export const models: Model[] = [
  { id: "gpt-5", name: "GPT 5", slug: "gpt-5" },
  { id: "grok-4", name: "Grok 4", slug: "grok-4" },
  { id: "sonnet-4.5", name: "Claude Sonnet 4.5", slug: "sonnet-4-5" },
  { id: "gemini-2.5", name: "Gemini 2.5 Pro", slug: "gemini-2-5" },
  { id: "deepseek-v3.1", name: "DeepSeek Chat v3.1", slug: "deepseek-v3-1" },
  { id: "qwen3-max", name: "Qwen3 Max", slug: "qwen3-max" },
];

export const walletBalances: WalletBalance[] = [
  { modelId: "gpt-5", currency: "USD", balanceUsd: 2979.94, pnl24hUsd: -120.12 },
  { modelId: "grok-4", currency: "USD", balanceUsd: 7527.63, pnl24hUsd: -221.23 },
  { modelId: "sonnet-4.5", currency: "USD", balanceUsd: 7880.12, pnl24hUsd: -98.64 },
  { modelId: "gemini-2.5", currency: "USD", balanceUsd: 4974.72, pnl24hUsd: 35.22 },
  { modelId: "deepseek-v3.1", currency: "USD", balanceUsd: 9064.69, pnl24hUsd: -943.55 },
  { modelId: "qwen3-max", currency: "USD", balanceUsd: 8430.37, pnl24hUsd: -57.1 },
];

export const trendingMarkets: Market[] = [
  {
    id: "m1",
    sport: "Soccer",
    league: "EPL",
    marketName: "Match Winner",
    eventTimeIso: new Date().toISOString(),
    teams: ["Arsenal", "Chelsea"],
    selection: "Arsenal",
    volumeUsd: 1223456,
  },
  {
    id: "m2",
    sport: "Basketball",
    league: "NBA",
    marketName: "Spread -6.5",
    eventTimeIso: new Date().toISOString(),
    teams: ["Lakers", "Warriors"],
    selection: "Warriors",
    volumeUsd: 823411,
  },
  {
    id: "m3",
    sport: "Tennis",
    league: "ATP",
    marketName: "Match Winner",
    eventTimeIso: new Date().toISOString(),
    teams: ["Alcaraz", "Sinner"],
    selection: "Sinner",
    volumeUsd: 312004,
  },
  {
    id: "m4",
    sport: "Baseball",
    league: "MLB",
    marketName: "Total Over/Under 8.5",
    eventTimeIso: new Date().toISOString(),
    teams: ["Dodgers", "Mets"],
    selection: "Over",
    volumeUsd: 225500,
  },
  {
    id: "m5",
    sport: "American Football",
    league: "NFL",
    marketName: "Moneyline",
    eventTimeIso: new Date().toISOString(),
    teams: ["49ers", "Chiefs"],
    selection: "Chiefs",
    volumeUsd: 1200550,
  },
];

export const liveBets: Trade[] = [
  {
    id: "t1",
    modelId: "grok-4",
    marketId: "m1",
    selection: "Arsenal",
    price: 1.8,
    quantity: 33.49,
    notionalUsd: 6022,
    openedAtIso: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    status: "open",
  },
  {
    id: "t2",
    modelId: "qwen3-max",
    marketId: "m2",
    selection: "Warriors",
    price: 1.95,
    quantity: 15.3,
    notionalUsd: 383.75,
    openedAtIso: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    status: "open",
  },
];

export const completedTrades: Trade[] = [
  {
    id: "t3",
    modelId: "gpt-5",
    marketId: "m2",
    selection: "Warriors",
    price: 1.75,
    quantity: 1.71,
    notionalUsd: 6472,
    openedAtIso: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    closedAtIso: new Date(Date.now() - 19 * 60 * 60 * 1000).toISOString(),
    pnlUsd: -143.56,
    status: "closed",
  },
  {
    id: "t4",
    modelId: "grok-4",
    marketId: "m4",
    selection: "Over",
    price: 1.2,
    quantity: 33.49,
    notionalUsd: 6002,
    openedAtIso: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    closedAtIso: new Date(Date.now() - 2 * 60 * 60 * 1000 + 2 * 60 * 1000).toISOString(),
    pnlUsd: -21.23,
    status: "closed",
  },
];

export const inferences: Inference[] = [
  {
    id: "i1",
    modelId: "grok-4",
    marketId: "m1",
    createdAtIso: new Date().toISOString(),
    summary: "Arsenal expected xG advantage; Chelsea injuries likely suppress attack.",
    sources: ["https://example.com/epl-preview", "https://x.com/some-analyst"],
  },
  {
    id: "i2",
    modelId: "sonnet-4.5",
    marketId: "m2",
    createdAtIso: new Date().toISOString(),
    summary: "Warriors perimeter shooting uptick; Lakers on back-to-back fatigue.",
  },
];

// Brand-aligned colors by model slug (used for line chart + legends)
const modelSlugToColor: Record<string, string> = {
  "gpt-5": "#22c55e", // green
  "grok-4": "#8b5cf6", // purple
  "sonnet-4-5": "#38bdf8", // light blue
  "gemini-2-5": "#f97316", // orange
  "deepseek-v3-1": "#eab308", // yellow
  "qwen3-max": "#6366f1", // indigo
  "btc-hodl": "#111827", // neutral/dark
};

const fallbackPalette = ["#22c55e", "#8b5cf6", "#38bdf8", "#f97316", "#eab308"];

export const accountSeries: AccountSeries[] = models.slice(0, 5).map((m, idx) => {
  const base = 10000;
  const points = Array.from({ length: 24 }, (_, i) => ({
    x: i,
    y: base + Math.sin((i / 24) * Math.PI * 2 + idx) * 1000 - i * 50 + idx * 120,
  }));
  const color = modelSlugToColor[m.slug] || fallbackPalette[idx % fallbackPalette.length];
  return { name: m.name, color, points };
});


