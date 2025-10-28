"use client";
import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { ChevronDown, ChevronUp, FileText } from "lucide-react";
import ReactMarkdown from "react-markdown";

type InferenceItem = { id: string; modelName: string; timestamp: string; prompt: string; reasoning: string };

const modelNameToSlug: Record<string, string> = {
  "GPT 5": "gpt-5",
  "Grok 4": "grok-4",
  "Claude Sonnet 4.5": "sonnet-4-5",
  "Gemini 2.5 Pro": "gemini-2-5",
  "Gemini 2.5 Flash": "gemini-2-5",
  "deepseek-chat-v3.1": "deepseek-v3-1",
  "qwen3-max": "qwen3-max",
};

export function InferencesList({ limit = 12, frameless = false }: { limit?: number; frameless?: boolean }) {
  const [items, setItems] = React.useState<Array<InferenceItem>>([]);
  const [hasMore, setHasMore] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const observerTarget = React.useRef<HTMLDivElement>(null);

  const loadMore = React.useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    
    try {
      const skip = items.length;
      const response = await fetch(`/api/inferences?skip=${skip}&limit=${limit}`, { cache: "no-store" });
      const data = await response.json();
      const newItems = data.inferences ?? [];
      
      if (newItems.length === 0) {
        setHasMore(false);
      } else {
        setItems(prev => {
          const seen = new Set(prev.map(p => `${p.id}-${p.timestamp}`));
          const merged = [...prev];
          for (const ni of newItems) {
            const key = `${ni.id}-${ni.timestamp}`;
            if (!seen.has(key)) {
              merged.push(ni);
              seen.add(key);
            }
          }
          return merged;
        });
      }
    } catch (error) {
      console.error("Error loading inferences:", error);
    } finally {
      setLoading(false);
    }
  }, [items.length, limit, loading, hasMore]);

  // Initial load
  React.useEffect(() => {
    let cancelled = false;
    fetch(`/api/inferences?skip=0&limit=${limit}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => {
        if (!cancelled) {
          const newItems = j.inferences ?? [];
          // de-duplicate by id+timestamp safeguard
          const seen = new Set<string>();
          const dedup = [] as InferenceItem[];
          for (const it of newItems) {
            const key = `${it.id}-${it.timestamp}`;
            if (!seen.has(key)) {
              dedup.push(it);
              seen.add(key);
            }
          }
          setItems(dedup);
          setHasMore(newItems.length >= limit);
        }
      })
      .catch(() => setItems([]));
    return () => {
      cancelled = true;
    };
  }, [limit]);

  // Intersection Observer for infinite scroll
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loading, loadMore]);

  const rows = items.map((i) => <InferenceCard key={i.id} item={i} />);

  if (frameless) {
    return (
      <div className="space-y-3">
        {rows}
        {hasMore && <div ref={observerTarget} className="h-4 flex items-center justify-center">
          {loading && <span className="text-xs text-muted-foreground">Loading...</span>}
        </div>}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent inferences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 p-3">
        {rows}
        {hasMore && <div ref={observerTarget} className="h-4 flex items-center justify-center">
          {loading && <span className="text-xs text-muted-foreground">Loading...</span>}
        </div>}
      </CardContent>
    </Card>
  );
}

function InferenceCard({ item }: { item: InferenceItem }) {
  const [openPrompt, setOpenPrompt] = React.useState(false);
  const [openReason, setOpenReason] = React.useState(false);
  const slug = modelNameToSlug[item.modelName] || "gpt-5";
  const needsWhite = slug === "gpt-5" || slug === "grok-4";
  const preview = (item.reasoning || item.prompt || "").slice(0, 140);

  return (
    <div className="rounded-lg border p-3 bg-card/70">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <Image src={`/models/${slug}.svg`} alt={item.modelName} width={18} height={18} className={needsWhite ? "dark:brightness-0 dark:invert" : ""} />
          <span className="truncate text-sm font-medium">{item.modelName}</span>
        </div>
        <span className="text-xs text-muted-foreground">{new Date(item.timestamp).toLocaleString()}</span>
      </div>

      <div className="mt-2 text-sm text-muted-foreground">
        {preview}
        {(item.reasoning || item.prompt) && (item.reasoning || item.prompt).length > 140 ? <span>…</span> : null}
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2 sm:flex sm:flex-row sm:gap-3">
        <button
          className="flex items-center gap-1 rounded-md border px-2 py-1 text-xs hover:bg-secondary"
          onClick={() => setOpenPrompt((v) => !v)}
        >
          <FileText className="h-3.5 w-3.5" /> Prompt {openPrompt ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>
        <button
          className="flex items-center gap-1 rounded-md border px-2 py-1 text-xs hover:bg-secondary"
          onClick={() => setOpenReason((v) => !v)}
        >
          <FileText className="h-3.5 w-3.5" /> Reasoning {openReason ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>
      </div>

      {openPrompt && (
        <div className="mt-2 rounded-md border bg-card p-2 text-sm markdown-content">
          <ReactMarkdown>{item.prompt || "—"}</ReactMarkdown>
        </div>
      )}
      {openReason && (
        <div className="mt-2 rounded-md border bg-card p-2 text-sm markdown-content">
          <ReactMarkdown>{item.reasoning || "—"}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}


