import { NextResponse } from "next/server";
import { VerifyOtpSchema } from "@/schemas";
import { verifyOtp } from "@/services/otp";
import { findOrCreateUser } from "@/services/users";
import { setSessionCookie } from "@/lib/auth";
export const runtime = "nodejs";
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = VerifyOtpSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const { email, code, name } = parsed.data;
  const res = await verifyOtp(email, code);
  if (!res.ok) return NextResponse.json({ error: res.error ?? "Invalid OTP" }, { status: 401 });
  const user = await findOrCreateUser(email, name);
  await setSessionCookie(user);
  return NextResponse.json({ ok: true, user });
}