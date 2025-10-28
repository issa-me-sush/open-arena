import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectMongo } from "@/src/db";
import { AiModel, DailyPick, ModelInference, LeaderboardSnapshot } from "@/src/models";

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

type ResetMode = "none" | "collections" | "db";

async function maybeReset(mode: ResetMode) {
  if (mode === "none") return;
  if (mode === "db") {
    await mongoose.connection.db?.dropDatabase();
    return;
  }
  const names = ["ai_models", "model_inferences", "daily_picks", "leaderboard_snapshots"];
  for (const name of names) {
    try {
      const exists = await mongoose.connection.db?.listCollections({ name }).hasNext();
      if (exists) await mongoose.connection.db?.collection(name).drop();
    } catch {
      // ignore
    }
  }
}

async function doSeed(resetMode: ResetMode = "none") {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      return NextResponse.json({ error: "MONGO_URI missing" }, { status: 500 });
    }
    const res = await connectMongo(uri);
    await maybeReset(resetMode);

    // Seed AI models
    const aiModels = [
      { name: "GPT 5", wallet_address: "0xgpt5", learnings: "prefers momentum + xG" },
      { name: "Grok 4", wallet_address: "0xgrok4", learnings: "aggressive risk-on moments" },
      { name: "Claude Sonnet 4.5", wallet_address: "0xsonnet45", learnings: "conservative, values defense" },
      { name: "DeepSeek Chat v3.1", wallet_address: "0xdeepseek31", learnings: "stat-heavy blend" },
    ];
    const modelDocs = await AiModel.insertMany(aiModels, { ordered: false }).catch(() => AiModel.find());

    // Daily pick (5 markets)
    const today = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate()));
    await DailyPick.updateOne(
      { date: today },
      { $set: { selected_markets: ["mkt-epl-ars-che", "mkt-nba-lal-gsw", "mkt-mlb-dod-mets", "mkt-nfl-sf-kc", "mkt-atp-alc-sin"] } },
      { upsert: true }
    );

    // Model inferences for each model/market (last hour)
    const now = new Date();
    const ticks = [0, 15, 30, 45];
    for (const m of modelDocs) {
      for (const mk of ["mkt-epl-ars-che", "mkt-nba-lal-gsw", "mkt-mlb-dod-mets"]) {
        for (const t of ticks) {
          const ts = new Date(now.getTime() - t * 60 * 1000);
          await ModelInference.replaceOne(
            { model_id: m._id, timestamp: ts },
            {
              model_id: m._id,
              timestamp: ts,
              prompt: `Analyze ${mk} with last-24h volume + injuries; produce buy/sell/hold.`,
              reasoning: "Momentum shift due to lineup change and recent form.",
            },
            { upsert: true }
          );
        }
      }
    }

    // Leaderboard snapshot (today)
    for (const m of modelDocs) {
      await LeaderboardSnapshot.updateOne(
        { model_id: m._id, date: today },
        {
          $set: {
            total_value: Math.floor(rand(5000, 15000)),
            realized_pnl: Math.floor(rand(-1000, 2000)),
            unrealized_pnl: Math.floor(rand(-500, 1500)),
            top_positions: ["mkt-epl-ars-che", "mkt-nba-lal-gsw"],
          },
        },
        { upsert: true }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    // eslint-disable-next-line no-console
    console.error("[seed] failed", { message: e?.message, name: e?.name, code: e?.code, reason: e?.reason?.message });
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

function parseReset(url: URL): ResetMode {
  const r = (url.searchParams.get("reset") || "").toLowerCase();
  if (r === "db" || r === "all") return "db";
  if (r === "1" || r === "true" || r === "collections") return "collections";
  return "none";
}

export async function POST(req: Request) {
  const url = new URL(req.url);
  return doSeed(parseReset(url));
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  return doSeed(parseReset(url));
}


