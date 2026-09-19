import { NextResponse } from "next/server";
import { RequestOtpSchema } from "@/schemas";
import { issueOtp } from "@/services/otp";
import { hit } from "@/lib/rate-limit";
export const runtime = "nodejs";
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = RequestOtpSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? `Only @${process.env.ALLOWED_EMAIL_DOMAIN ?? "gvpce.ac.in"} addresses are allowed.`;
    return NextResponse.json({ error: message }, { status: 400 });
  }
  const { email } = parsed.data;
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const [byEmail, byIp] = await Promise.all([hit(`otp:email:${email}`, 5, 600), hit(`otp:ip:${ip}`, 20, 600)]);
  if (!byEmail.ok) return NextResponse.json({ error: "Too many requests for this email." }, { status: 429 });
  if (!byIp.ok) return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  const res = await issueOtp(email);
  if (!res.ok) return NextResponse.json({ error: res.error ?? "Unable to send OTP" }, { status: 502 });
  return NextResponse.json({ ok: true, message: "OTP sent" });
}