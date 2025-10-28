import { NextResponse } from "next/server";
import { connectMongo } from "@/src/db";
import { DailyPick, type IDailyPick } from "@/src/models";

export async function GET() {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) return NextResponse.json({ error: "MONGO_URI missing" }, { status: 500 });
    await connectMongo(uri);

    // Use a UTC date range for today to avoid exact timestamp mismatch
    const now = new Date();
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));

    let pick: IDailyPick | null = await DailyPick.findOne({ date: { $gte: start, $lt: end } }).lean<IDailyPick>();
    // Fallback: use the most recent pick if there isn't one for today
    if (!pick) {
      pick = await DailyPick.findOne({}).sort({ date: -1 }).lean<IDailyPick>();
    }

    const slugs: string[] = pick?.selected_markets ?? [];
    if (!slugs.length) return NextResponse.json({ markets: [] });

    // Fetch in parallel from Polymarket
    const results = await Promise.all(
      slugs.slice(0, 5).map(async (slug) => {
        try {
          const r = await fetch(`https://gamma-api.polymarket.com/markets/slug/${encodeURIComponent(slug)}`, { cache: "no-store" });
          if (!r.ok) throw new Error("bad response");
          const j = await r.json();
          const toArray = (val: any) => {
            try {
              if (!val) return null;
              return Array.isArray(val) ? val : JSON.parse(val);
            } catch {
              return null;
            }
          };
          const outcomes = toArray(j.shortOutcomes ?? j.outcomes);
          const prices = toArray(j.outcomePrices)?.map((x: any) => Number(x));
          return {
            slug,
            question: j.question,
            category: j.category,
            volume24hr: j.volume24hr ?? j.volume24hrAmm ?? 0,
            volume: j.volumeNum ?? 0,
            image: j.imageOptimized?.imageUrlOptimized ?? j.image ?? null,
            iconUrl:
              j.iconOptimized?.imageUrlOptimized ??
              j.iconOptimized?.imageUrlSource ??
              j.icon ?? null,
            outcomes,
            prices,
            endDateIso: j.endDateIso ?? (j.endDate ? j.endDate.slice(0, 10) : null),
            endDate: j.endDate ?? null,
            gameStartTime: j.gameStartTime ?? null,
          };
        } catch {
          return { slug, question: slug, category: "", volume24hr: 0, volume: 0, image: null, endDateIso: null };
        }
      })
    );

    return NextResponse.json({ markets: results });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}


