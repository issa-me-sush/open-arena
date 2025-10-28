"use client";
import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InferencesList } from "@/components/dashboard/InferencesList";
import { LivePositions, CompletedPositions } from "@/components/dashboard/PositionsList";
import { TradesList } from "@/components/dashboard/TradesList";
import { Inference, Market, Model, Trade } from "@/lib/types";

type Props = {
  markets: Market[];
  models: Model[];
  completedTrades: Trade[];
  liveBets: Trade[];
  inferences: Inference[];
  height?: number;
  matchElementId?: string;
};

export function RightPanel({ markets, models, completedTrades, liveBets, inferences, height = 360, matchElementId }: Props) {
  const [matchedHeight, setMatchedHeight] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (!matchElementId) return;
    const el = document.getElementById(matchElementId);
    if (!el) return;
    const update = () => setMatchedHeight(el.getBoundingClientRect().height);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [matchElementId]);

  const panelHeight = matchedHeight ?? height;

  return (
    <Card className="flex h-full flex-col card-accent-green" style={{ height: panelHeight }}>
      <Tabs defaultValue="completed" className="flex h-full flex-col">
        <CardHeader className="p-3 pb-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Model activity</CardTitle>
            <TabsList>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="live">Live</TabsTrigger>
              <TabsTrigger value="inferences">Inferences</TabsTrigger>
            </TabsList>
          </div>
        </CardHeader>
        <CardContent className="min-h-0 flex-1 p-3 pt-2">
          <TabsContent value="completed" className="h-full">
            <div className="h-full overflow-auto pr-1">
              <CompletedPositions />
            </div>
          </TabsContent>
          <TabsContent value="live" className="h-full">
            <div className="h-full overflow-auto pr-1">
              <LivePositions />
            </div>
          </TabsContent>
          <TabsContent value="inferences" className="h-full">
            <div className="h-full overflow-auto pr-1">
              <InferencesList limit={5} frameless />
            </div>
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  );
}


