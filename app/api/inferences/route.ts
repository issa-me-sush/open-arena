import { NextResponse } from "next/server";
import { connectMongo } from "@/src/db";
import { ModelInference, AiModel } from "@/src/models";

export async function GET(request: Request) {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) return NextResponse.json({ error: "MONGO_URI missing" }, { status: 500 });
    await connectMongo(uri);

    // Pagination parameters
    const { searchParams } = new URL(request.url);
    const skip = parseInt(searchParams.get("skip") || "0", 10);
    const limit = parseInt(searchParams.get("limit") || "12", 10);

    const docs = await ModelInference.find({})
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    interface InferenceDoc {
      _id: unknown;
      model_id: unknown;
      timestamp: string;
      prompt: string;
      reasoning?: string;
    }

    interface ModelDoc {
      _id: unknown;
      name: string;
      wallet_address: string;
    }

    const modelIds = [...new Set(docs.map((d) => String((d as unknown as InferenceDoc).model_id)))];
    const models = await AiModel.find({ _id: { $in: modelIds } })
      .select({ name: 1, wallet_address: 1 })
      .lean();
    const idToModel: Record<string, ModelDoc> = Object.fromEntries(
      models.map((m) => [String((m as unknown as ModelDoc)._id), m as unknown as ModelDoc])
    );

    const data = docs.map((d) => {
      const doc = d as unknown as InferenceDoc;
      return {
        id: String(doc._id),
        modelId: String(doc.model_id),
        modelName: idToModel[String(doc.model_id)]?.name ?? "Model",
        timestamp: doc.timestamp,
        prompt: doc.prompt,
        reasoning: doc.reasoning ?? "",
      };
    });

    return NextResponse.json({ inferences: data });
  } catch (e) {
    const error = e as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


