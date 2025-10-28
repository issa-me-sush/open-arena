import { AccountValueChart } from "@/components/dashboard/AccountValueChart";
import { TotalValueChart } from "@/components/dashboard/TotalValueChart";
import { MarketsTicker } from "@/components/dashboard/MarketsTicker";
import { WalletBalances } from "@/components/dashboard/WalletBalances";
import { TradesList } from "@/components/dashboard/TradesList";
import { InferencesList } from "@/components/dashboard/InferencesList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { accountSeries, trendingMarkets, walletBalances, completedTrades, liveBets, models, inferences } from "@/lib/mockData";
import { BottomWalletBar } from "@/components/layout/BottomWalletBar";
import { RightPanel } from "@/components/dashboard/RightPanel";

export default function Home() {
  return (
    <div className="min-h-screen bg-background font-sans overflow-hidden">
      <main className="mx-auto flex w-full max-w-[1600px] flex-col px-4 pt-2 sm:pt-3">
        <div className="mb-3">
          <MarketsTicker markets={trendingMarkets} />
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3 flex-1 min-h-[calc(100vh-260px)] sm:min-h-[calc(100vh-280px)]">
          <div className="lg:col-span-2 h-full">
            <TotalValueChart />
          </div>
          <aside className="lg:col-span-1 lg:sticky lg:top-16 self-start h-full">
            {(() => {
              const expandWithIds = <T extends { id: string }>(arr: T[], times: number): T[] =>
                Array.from({ length: times }, (_, i) =>
                  arr.map((it, j) => ({ ...it, id: `${it.id}-${i}-${j}` }))
                ).flat() as T[];
              const moreCompleted = expandWithIds(completedTrades, 24);
              const moreLive = expandWithIds(liveBets, 24);
              const moreInferences = expandWithIds(inferences, 24);
              return (
                <RightPanel
                  markets={trendingMarkets}
                  models={models}
                  completedTrades={moreCompleted}
                  liveBets={moreLive}
                  inferences={moreInferences}
                  height={420}
                  matchElementId="account-chart"
                />
              );
            })()}
          </aside>
        </div>

        {/* Bottom wallet section (not fixed) */}
        <BottomWalletBar balances={walletBalances} models={models} />
      </main>
    </div>
  );
}
