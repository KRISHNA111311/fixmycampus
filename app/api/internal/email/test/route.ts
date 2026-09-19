import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { sendTestEmail } from "@/lib/email";
export const runtime = "nodejs";
export async function POST() {
  try { await requireAdmin(); }
  catch { return NextResponse.json({ error: "Forbidden" }, { status: 403 }); }
  const result = await sendTestEmail();
  if (result.ok) return NextResponse.json({ ok: true, message: "Test email sent" });
  return NextResponse.json({ ok: false, message: "SMTP configuration failed", error: result.error }, { status: 502 });
}