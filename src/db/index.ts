import mongoose from "mongoose";

let conn: typeof mongoose | null = null;
let connecting: Promise<typeof mongoose> | null = null;

function maskUri(uri: string) {
  try {
    const u = new URL(uri);
    if (u.username) u.username = "***";
    if (u.password) u.password = "***";
    return u.toString();
  } catch {
    return "<invalid-uri>";
  }
}

export async function connectMongo(uri: string) {
  if (conn) return conn;
  if (connecting) return connecting;
  const dbName = process.env.MONGO_DB || "alpha-arena";
  // Basic diagnostics in dev
  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.log("[mongo] connecting", { uri: maskUri(uri), dbName });
  }
  connecting = mongoose.connect(uri, {
    dbName,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 10000,
    family: 4,
  });
  try {
    conn = await connecting;
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.log("[mongo] connected", { host: conn.connection.host, db: conn.connection.name });
    }
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error("[mongo] failed", {
      message: err?.message,
      name: err?.name,
      code: err?.code,
      reason: err?.reason?.message,
    });
    throw err;
  }
  return conn;
}


