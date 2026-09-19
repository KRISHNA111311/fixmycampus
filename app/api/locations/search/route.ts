import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
export const runtime = "nodejs";
export async function GET(req: Request) {
  const u = new URL(req.url);
  const q = u.searchParams.get("q")?.trim();
  if (!q || q.length < 2) return NextResponse.json({ results: [] });
  const safe = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const rx = { $regex: safe, $options: "i" };
  const db = await getDb();
  const [rooms, places, buildings] = await Promise.all([
    db.collection("rooms").find({ active: { $ne: false }, $or: [{ displayName: rx }, { roomName: rx }, { department: rx }] }).limit(12).toArray(),
    db.collection("campusPlaces").find({ active: { $ne: false }, $or: [{ name: rx }, { aliases: rx }] }).limit(8).toArray(),
    db.collection("buildings").find({ active: { $ne: false }, $or: [{ code: rx }, { name: rx }] }).limit(5).toArray()
  ]);
  return NextResponse.json({ results: [
    ...rooms.map(r => ({ kind: "ROOM", id: String(r._id), displayName: r.displayName, subtitle: [r.department, r.roomName, r.roomType].filter(Boolean).join(" Â· "), payload: { kind: "ROOM", buildingCode: r.buildingCode, roomNumber: r.roomNumber, displayName: r.displayName, department: r.department, roomType: r.roomType, coordinates: r.coordinates } })),
    ...places.map(p => ({ kind: p.kind ?? "FACILITY", id: String(p._id), displayName: p.name, subtitle: p.department ?? p.kind ?? "Campus place", payload: { kind: p.kind ?? "FACILITY", displayName: p.name, placeName: p.name, department: p.department, coordinates: p.coordinates } })),
    ...buildings.map(b => ({ kind: "BUILDING", id: String(b._id), displayName: b.code, subtitle: b.name ?? "Building", payload: { kind: "BUILDING", buildingCode: b.code, buildingName: b.name, displayName: b.code } }))
  ] });
}