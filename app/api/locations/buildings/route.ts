import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
export const runtime = "nodejs";
export async function GET() {
  const db = await getDb();
  const rows = await db.collection("buildings").find({ active: { $ne: false } }).sort({ code: 1 }).toArray();
  return NextResponse.json({ buildings: rows.map(b => ({ code: b.code, name: b.name, floors: b.floors ?? [] })) });
}