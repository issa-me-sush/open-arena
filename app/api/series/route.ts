import { NextResponse } from "next/server";
import { connectMongo } from "@/src/db";
import { AiModel, LeaderboardSnapshot } from "@/src/models";

// Returns hourly series of total_value for the last 24h per model
export async function GET() {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) return NextResponse.json({ error: "MONGO_URI missing" }, { status: 500 });
    await connectMongo(uri);

    const models = await AiModel.find({}).select({ name: 1 }).lean();
    const now = new Date();
    const start = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const out: any[] = [];
    for (const m of models) {
      const snaps = await LeaderboardSnapshot.find({
        model_id: m._id,
        date: { $gte: start, $lte: now },
      })
        .sort({ date: 1 })
        .lean();

      // group to hourly buckets
      const buckets: Record<string, number> = {};
      for (const s of snaps) {
        const d = new Date(s.date as any);
        const key = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), d.getUTCHours())).toISOString();
        const val = (s as any).total_value ?? 0;
        buckets[key] = val; // take latest within hour (sorted asc)
      }
      const points: { time: string; value: number }[] = [];
      for (let i = 0; i <= 24; i++) {
        const t = new Date(start.getTime() + i * 60 * 60 * 1000);
        const key = new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate(), t.getUTCHours())).toISOString();
        const v = buckets[key];
        if (typeof v === "number") points.push({ time: key, value: v });
      }
      out.push({ modelId: String(m._id), modelName: m.name, points });
    }

    return NextResponse.json({ series: out });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}


