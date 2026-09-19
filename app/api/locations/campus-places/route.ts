import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
export const runtime = "nodejs";
export async function GET(req: Request) {
  const u = new URL(req.url);
  const q = u.searchParams.get("q")?.trim();
  const db = await getDb();
  const f: any = { active: { $ne: false }, verified: true };
  if (q) {
    const safe = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    f.$or = [{ name: { $regex: safe, $options: "i" } }, { aliases: { $regex: safe, $options: "i" } }];
  }
  const rows = await db.collection("campusPlaces").find(f).sort({ name: 1 }).limit(200).toArray();
  return NextResponse.json({ places: rows.map(p => ({ _id: String(p._id), name: p.name, kind: p.kind, department: p.department, coordinates: p.coordinates, icon: p.icon })) });
}