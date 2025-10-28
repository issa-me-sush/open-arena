import ModelInference from "./ModelInference";

export async function ensureTTL() {
  await ModelInference.collection.createIndex(
    { timestamp: 1 },
    { expireAfterSeconds: 60 * 60 * 24 * 90, name: "ttl_inference_90d" }
  );
}


