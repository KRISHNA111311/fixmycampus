import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { findDuplicates } from "@/services/duplicates";
import { LocationZ, CategoryZ } from "@/schemas";
export const runtime = "nodejs";
const Body = z.object({ description: z.string().min(2).max(1200), category: CategoryZ, location: LocationZ });
export async function POST(req: Request) {
  try { await requireUser(); }
  catch { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); }
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  return NextResponse.json({ candidates: await findDuplicates(parsed.data) });
}