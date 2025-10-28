"use client";
import * as React from "react";
import Image from "next/image";
import { WalletBalance, Model } from "@/lib/types";

function formatUsd(n: number) {
  return n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 });
}

export function BottomWalletBar({ balances, models }: { balances?: WalletBalance[]; models?: Model[] }) {
  const [items, setItems] = React.useState<Array<{ name: string; slug: string; value: number }>>([]);

  React.useEffect(() => {
    // Prefer live snapshots; fallback to provided props
    fetch("/api/snapshots", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => {
        if (!j?.models) return;
        const mapped = j.models.map((m: any) => {
          const latest = m.snapshots?.[0];
          const name: string = m.modelName;
          const slugMap: Record<string, string> = {
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
          const slug = slugMap[name] || name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
          const value = latest?.total_value ?? latest?.portfolio_value ?? 0;
          return { name, slug, value };
        });
        setItems(mapped);
      })
      .catch(() => {
        if (balances && models) {
          const byModel = (id: string) => models.find((m) => m.id === id)!;
          setItems(
            balances.map((b) => {
              const m = byModel(b.modelId);
              return { name: m.name, slug: m.slug, value: b.balanceUsd };
            })
          );
        }
      });
  }, [balances, models]);

  return (
    <div className="w-full border-t bg-background/90 pt-4 mt-2">
      <div className="mx-auto flex w-full max-w-[1600px] flex-wrap content-start items-stretch justify-between gap-3 px-4 pb-2">
        {items.map((it) => {
          const needsWhite = it.slug === "gpt-5" || it.slug === "grok-4";
          return (
            <div key={it.name} className="flex min-w-[152px] flex-col justify-center rounded-md border px-3 py-2">
              <div className="flex items-center gap-2">
                <Image src={`/models/${it.slug}.svg`} alt={it.name} width={16} height={16} className={needsWhite ? "dark:brightness-0 dark:invert" : ""} />
                <span className="truncate text-[10px] text-muted-foreground">{it.name}</span>
              </div>
              <span className="mt-1 text-sm">{formatUsd(it.value)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}


