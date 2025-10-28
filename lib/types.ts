export type Model = {
  id: string;
  name: string;
  slug: string;
  description?: string;
};

export type WalletBalance = {
  modelId: string;
  currency: string;
  balanceUsd: number;
  pnl24hUsd: number;
};

export type Market = {
  id: string;
  sport: string;
  league: string;
  marketName: string;
  eventTimeIso: string;
  teams: [string, string];
  selection?: string;
  volumeUsd?: number;
};

export type TradeStatus = "open" | "closed";

export type Trade = {
  id: string;
  modelId: string;
  marketId: string;
  selection: string;
  price: number;
  quantity: number;
  notionalUsd: number;
  openedAtIso: string;
  closedAtIso?: string;
  pnlUsd?: number;
  status: TradeStatus;
};

export type Inference = {
  id: string;
  modelId: string;
  marketId: string;
  createdAtIso: string;
  summary: string;
  sources?: string[];
};

export type AccountSeriesPoint = { x: number; y: number };
export type AccountSeries = { name: string; color: string; points: AccountSeriesPoint[] };


