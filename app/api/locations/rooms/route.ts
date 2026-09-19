import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
export const runtime = "nodejs";
export async function GET(req: Request) {
  const u = new URL(req.url);
  const building = u.searchParams.get("building");
  const floor = u.searchParams.get("floor");
  const q = u.searchParams.get("q")?.trim();
  const db = await getDb();
  const f: any = { active: { $ne: false }, verified: true };
  if (building) f.buildingCode = building;
  if (floor) f.floor = Number(floor);
  if (q) {
    const safe = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    f.$or = [
      { displayName: { $regex: safe, $options: "i" } },
      { roomName: { $regex: safe, $options: "i" } },
      { department: { $regex: safe, $options: "i" } }
    ];
  }
  const rows = await db.collection("rooms").find(f).sort({ buildingCode: 1, floor: 1, roomNumber: 1 }).limit(200).toArray();
  return NextResponse.json({ rooms: rows.map(r => ({ _id: String(r._id), buildingCode: r.buildingCode, roomNumber: r.roomNumber, displayName: r.displayName, floor: r.floor, department: r.department, departmentCode: r.departmentCode, roomType: r.roomType, roomName: r.roomName })) });
}