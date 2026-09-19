import crypto from "crypto";
import { getDb } from "@/lib/mongodb";
import { sendOtpEmail } from "@/lib/email";
const TTL = Number(process.env.OTP_TTL_SECONDS ?? 600);
const hash = (c: string) => crypto.createHash("sha256").update(c).digest("hex");
export async function issueOtp(email: string): Promise<{ ok: boolean; error?: string }> {
  const db = await getDb();
  const code = String(crypto.randomInt(100000, 999999));
  await db.collection("otps").deleteMany({ email });
  await db.collection("otps").insertOne({ email, codeHash: hash(code), createdAt: new Date(), attempts: 0, consumed: false });
  const res = await sendOtpEmail(email, code);
  if (!res.ok) {
    await db.collection("otps").deleteMany({ email });
    return { ok: false, error: res.error ?? "Unable to send OTP email" };
  }
  return { ok: true };
}
export async function verifyOtp(email: string, code: string): Promise<{ ok: boolean; error?: string }> {
  const db = await getDb();
  const rec = await db.collection("otps").findOne({ email });
  if (!rec) return { ok: false, error: "No OTP requested for this email" };
  if (rec.consumed) return { ok: false, error: "OTP already used" };
  if (rec.attempts >= 5) return { ok: false, error: "Too many attempts" };
  if (Date.now() - new Date(rec.createdAt).getTime() > TTL * 1000) return { ok: false, error: "OTP expired" };
  if (hash(code) !== rec.codeHash) {
    await db.collection("otps").updateOne({ _id: rec._id }, { $inc: { attempts: 1 } });
    return { ok: false, error: "Incorrect code" };
  }
  await db.collection("otps").updateOne({ _id: rec._id }, { $set: { consumed: true, consumedAt: new Date() } });
  return { ok: true };
}