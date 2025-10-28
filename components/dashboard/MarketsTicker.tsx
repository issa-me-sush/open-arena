"use client";
import * as React from "react";
import { Market } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Meteors } from "@/components/ui/Meteors";
import { Info } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type TrendingMarket = {
  id?: string;
  slug: string;
  question: string;
  category?: string;
  volume24hr?: number;
  image?: string | null;
  iconUrl?: string | null;
  outcomes?: string[] | null;
  prices?: number[] | null;
  endDate?: string | null;
  endDateIso?: string | null;
  gameStartTime?: string | null;
};

export function MarketsTicker({ markets }: { markets: Market[] }) {
  const [trending, setTrending] = React.useState<TrendingMarket[] | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [openPopover, setOpenPopover] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    fetch("/api/trending", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => {
        if (!cancelled) setTrending(j.markets ?? []);
      })
      .catch(() => setTrending([]))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const list: TrendingMarket[] = trending ?? [];

  return (
    <Card className="relative bg-secondary/60 card-accent-green">
      <CardHeader className="p-4 pb-0">
        <CardTitle className="text-sm">Trending markets (24h)</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto p-3">
        <div className="flex min-w-[560px] gap-2 flex-nowrap items-stretch">
          <div className="pointer-events-none absolute inset-0 opacity-40">
            <Meteors number={12} />
          </div>
          {loading && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground px-3 py-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
              Loading trending markets…
            </div>
          )}
          {!loading && list.length === 0 && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground px-3 py-2">
              No trending markets available.
            </div>
          )}
          {!loading && list.map((m: TrendingMarket) => (
            <div
              key={(m.slug || m.id)}
              className="group relative flex min-w-72 items-center justify-between rounded-xl border px-3 py-2 bg-card/80 hover:bg-card card-accent-green"
            >
              <div className="flex min-w-0 items-center gap-2">
                {m.iconUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.iconUrl} alt="icon" className="h-5 w-5 rounded" />
                ) : null}
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{m.question || ""}</div>
                  {/* {m.outcomes && m.prices ? (
                    <div className="truncate text-[11px] text-muted-foreground">
                      {m.outcomes
                        .slice(0, 2)
                        .map((o: string, i: number) => `${o} ${(m.prices?.[i] ?? 0)}`)
                        .join(" vs ")}
                    </div>
                  ) : null} */}
                </div>
              </div>
              <div className="ml-3 shrink-0 text-[11px] text-muted-foreground flex items-center gap-2">
                {m.endDate ? new Date(m.endDate).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC' }) + ' UTC' : null}
                <Popover 
                  open={openPopover === (m.slug || m.id || '')} 
                  onOpenChange={(open) => setOpenPopover(open ? (m.slug || m.id || '') : null)}
                >
                  <PopoverTrigger asChild>
                    <button
                      aria-label="Market details"
                      className="rounded-full border p-1 hover:bg-secondary"
                      onMouseEnter={() => setOpenPopover(m.slug || m.id || '')}
                      onMouseLeave={() => setOpenPopover(null)}
                    >
                      <Info className="h-3.5 w-3.5" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent 
                    align="center" 
                    side="bottom" 
                    className="w-64 p-2"
                    onMouseEnter={() => setOpenPopover(m.slug || m.id || '')}
                    onMouseLeave={() => setOpenPopover(null)}
                  >
                    <div className="flex items-center gap-2 text-xs">
                      {m.iconUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={m.iconUrl} alt="icon" className="h-5 w-5 rounded" />
                      ) : null}
                      <div className="min-w-0">
                        <div className="truncate font-medium">{m.question}</div>
                        {m.outcomes && m.prices ? (
                          <div className="text-[11px] text-muted-foreground">
                            {m.outcomes.map((o: string, i: number) => (
                              <span key={o} className="mr-3">{o}: {(m.prices?.[i] ?? 0)}</span>
                            ))}
                          </div>
                        ) : null}
                        {m.endDate ? (
                          <div className="text-[11px] text-muted-foreground">Ends: {new Date(m.endDate).toUTCString()}</div>
                        ) : null}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}


