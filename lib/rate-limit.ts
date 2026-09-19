import { getDb } from "./mongodb";
export async function hit(key: string, limit: number, windowSec: number) {
  const db = await getDb();
  const now = new Date();
  const resetAt = new Date(now.getTime() + windowSec * 1000);
  const ex = await db.collection("rateLimits").findOne({ key });
  if (!ex || ex.resetAt < now) {
    await db.collection("rateLimits").updateOne(
      { key }, { $set: { key, count: 1, resetAt } }, { upsert: true }
    );
    return { ok: true, remaining: limit - 1 };
  }
  if (ex.count >= limit) return { ok: false, remaining: 0 };
  await db.collection("rateLimits").updateOne({ key }, { $inc: { count: 1 } });
  return { ok: true, remaining: limit - ex.count - 1 };
}