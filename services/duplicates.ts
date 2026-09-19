import { getDb } from "@/lib/mongodb";
import type { NormalizedLocation } from "@/types";
const STOP = new Set(["the","and","for","with","this","that","from","into","near","there","here","issue","problem","please","very","some"]);
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(w => w.length > 2 && !STOP.has(w));
const jac = (a: Set<string>, b: Set<string>) => {
  if (!a.size || !b.size) return 0;
  let i = 0; for (const t of a) if (b.has(t)) i++;
  return i / (a.size + b.size - i);
};
export async function findDuplicates(input: { description: string; category: string; location: NormalizedLocation }) {
  const db = await getDb();
  const since = new Date(Date.now() - 60 * 24 * 3600 * 1000);
  const filter: any = { category: input.category, status: { $nin: ["CLOSED","VERIFIED"] }, createdAt: { $gte: since } };
  if (input.location.kind === "ROOM" && input.location.buildingCode) {
    filter["location.buildingCode"] = input.location.buildingCode;
    filter["location.roomNumber"] = input.location.roomNumber;
  } else if (input.location.placeName) {
    filter["location.placeName"] = input.location.placeName;
  }
  let docs = await db.collection("issues").find(filter).limit(20).toArray();
  if (!docs.length && input.location.coordinates) {
    docs = await db.collection("issues").find({
      "location.coordinates": { $near: { $geometry: input.location.coordinates, $maxDistance: 80 } },
      status: { $nin: ["CLOSED","VERIFIED"] }, createdAt: { $gte: since }
    }).limit(20).toArray();
  }
  const tokens = new Set(norm(input.description));
  return docs.map(d => {
    const other = new Set(norm(String(d.title) + " " + String(d.description)));
    const s = Math.min(1, jac(tokens, other) * 0.6 + (d.location?.displayName === input.location.displayName ? 0.4 : 0));
    return { _id: String(d._id), issueCode: d.issueCode, title: d.title, category: d.category, severity: d.severity, status: d.status, displayName: d.location?.displayName ?? "", supporters: d.supporters ?? 0, score: s };
  }).sort((a, b) => b.score - a.score).slice(0, 3);
}