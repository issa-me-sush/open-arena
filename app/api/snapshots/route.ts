import { NextResponse } from "next/server";
import { connectMongo } from "@/src/db";
import { AiModel, LeaderboardSnapshot } from "@/src/models";

export async function GET() {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) return NextResponse.json({ error: "MONGO_URI missing" }, { status: 500 });
    await connectMongo(uri);

    const models = await AiModel.find({}).select({ name: 1, wallet_address: 1 }).lean();

    // latest 2 snapshots per model
    const data = await Promise.all(
      models.map(async (m: any) => {
        const snaps = await LeaderboardSnapshot.find({ model_id: m._id })
          .sort({ date: -1 })
          .limit(2)
          .lean();
        return {
          modelId: String(m._id),
          modelName: m.name,
          wallet: m.wallet_address,
          snapshots: snaps.map((s: any) => ({
            id: String(s._id),
            date: s.date,
            portfolio_value: s.total_value ?? s.portfolio_value ?? 0,
            total_value: s.total_value ?? 0,
            top_positions: s.top_positions ?? [],
          })),
        };
      })
    );

    return NextResponse.json({ models: data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}


