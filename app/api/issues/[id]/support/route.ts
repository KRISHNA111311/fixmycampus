import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { supportIssue } from "@/services/issues";
export const runtime = "nodejs";
export async function POST(_: Request, { params }: { params: { id: string } }) {
  let user;
  try { user = await requireUser(); }
  catch { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); }
  const res = await supportIssue(params.id, user);
  if (!res.ok) return NextResponse.json({ error: res.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}