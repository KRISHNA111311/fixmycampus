import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { analyzeImage } from "@/lib/gemini";
export const runtime = "nodejs";
export const maxDuration = 30;
const OK = new Set(["image/jpeg","image/png","image/webp"]);
const MAX = 6 * 1024 * 1024;
export async function POST(req: Request) {
  try { await requireUser(); }
  catch { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); }
  const form = await req.formData().catch(() => null);
  const file = form?.get("image");
  if (!(file instanceof File)) return NextResponse.json({ error: "image is required" }, { status: 400 });
  if (!OK.has(file.type)) return NextResponse.json({ error: "Unsupported image type" }, { status: 415 });
  if (file.size > MAX) return NextResponse.json({ error: "Image too large (max 6MB)" }, { status: 413 });
  const buf = Buffer.from(await file.arrayBuffer());
  const result = await analyzeImage(buf.toString("base64"), file.type);
  if (!result) return NextResponse.json({ error: "AI_UNAVAILABLE", message: "AI analysis is temporarily unavailable. You can continue manually." }, { status: 503 });
  return NextResponse.json({ analysis: result });
}