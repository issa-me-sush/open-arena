import { NextResponse } from "next/server";
import { connectMongo } from "@/src/db";
import { AiModel } from "@/src/models";

export async function GET(req: Request) {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) return NextResponse.json({ error: "MONGO_URI missing" }, { status: 500 });
    await connectMongo(uri);

    const models = await AiModel.find({}).select({ name: 1, wallet_address: 1 }).lean();
    const urlObj = new URL(req.url);
    const limit = Math.min(parseInt(urlObj.searchParams.get("limit") || "50", 10), 500);
    const offset = Math.min(parseInt(urlObj.searchParams.get("offset") || "0", 10), 10000);
    const sortBy = urlObj.searchParams.get("sortBy") || "REALIZEDPNL";
    const sortDirection = urlObj.searchParams.get("sortDirection") || "DESC";

    const results = await Promise.all(
      models.map(async (m: any) => {
        try {
          const url = `https://data-api.polymarket.com/closed-positions?limit=${limit}&offset=${offset}&sortBy=${encodeURIComponent(
            sortBy
          )}&sortDirection=${encodeURIComponent(sortDirection)}&user=${encodeURIComponent(
            m.wallet_address
          )}`;
          const r = await fetch(url, { cache: "no-store" });
          const items = r.ok ? await r.json() : [];
          return { modelName: m.name, wallet: m.wallet_address, positions: items };
        } catch {
          return { modelName: m.name, wallet: m.wallet_address, positions: [] };
        }
      })
    );

    return NextResponse.json({ models: results });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}


