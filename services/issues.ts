import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { computeImpact } from "@/lib/impact";
import type { SessionUser } from "@/types";
import type { z } from "zod";
import type { CreateIssueSchema } from "@/schemas";
type CreateInput = z.infer<typeof CreateIssueSchema>;
async function nextIssueCode() {
  const db = await getDb();

  const res = await db
    .collection<{ _id: string; seq: number }>("counters")
    .findOneAndUpdate(
      { _id: "issues" },
      { $inc: { seq: 1 } },
      {
        upsert: true,
        returnDocument: "after",
        includeResultMetadata: false
      }
    );

  if (!res || typeof res.seq !== "number") {
    throw new Error("Unable to allocate issue sequence");
  }

  return `FC-${1000 + res.seq}`;
}
export async function createIssue(input: CreateInput, user: SessionUser, options: { isDemo?: boolean } = {}) {
  const db = await getDb();
  const now = new Date();
  const recentCount = await db.collection("issues").countDocuments({
    "location.displayName": input.location.displayName, category: input.category,
    createdAt: { $gte: new Date(now.getTime() - 90 * 24 * 3600 * 1000) }
  });
  const impact = computeImpact({
    severity: input.severity, affectedUsers: input.affectedUsers, supporters: 0,
    hoursUnresolved: 0, repeatsIn90d: recentCount, locationDisplayName: input.location.displayName
  });
  const doc = {
    issueCode: await nextIssueCode(),
    title: input.title, description: input.description, originalDescription: input.originalDescription,
    category: input.category, subcategory: input.subcategory, severity: input.severity,
    impactScore: impact.score, impactReasons: impact.reasons,
    location: input.location, images: input.images, status: "OPEN" as const,
    reportedBy: user._id, reportedByEmail: user.email,
    affectedUsers: input.affectedUsers, supporters: 0, supporterIds: [] as string[],
    assignedDepartment: input.location.department, assignedStaff: null,
    ai: input.ai ? {
      object: input.ai.object, problem: input.ai.problem,
      categorySuggestion: input.ai.categorySuggestion,
      severitySuggestion: input.ai.severitySuggestion,
      safetyRisk: input.ai.safetyRisk ?? false,
      confidence: input.ai.confidence ?? 0,
      generatedDescription: input.ai.generatedDescription,
      uncertainties: input.ai.uncertainties ?? []
    } : undefined,
    isDemo: Boolean(options.isDemo), createdAt: now, updatedAt: now,
    statusHistory: [{ status: "OPEN", at: now, by: user._id, note: "Reported" }]
  };
  const { insertedId } = await db.collection("issues").insertOne(doc);
  return { _id: String(insertedId), ...doc };
}
export async function getIssueById(id: string) {
  if (!ObjectId.isValid(id)) return null;
  const db = await getDb();
  const doc = await db.collection("issues").findOne({ _id: new ObjectId(id) });
  if (!doc) return null;
  return { ...doc, _id: String(doc._id) };
}
export async function listIssues(p: { status?: string; category?: string; severity?: string; building?: string; limit?: number; cursor?: string }) {
  const db = await getDb();
  const f: any = { isDemo: { $ne: true } };
  if (p.status) f.status = p.status;
  if (p.category) f.category = p.category;
  if (p.severity) f.severity = p.severity;
  if (p.building) f["location.buildingCode"] = p.building;
  if (p.cursor) f._id = { $lt: new ObjectId(p.cursor) };
  const limit = Math.min(p.limit ?? 20, 50);
  const docs = await db.collection("issues").find(f).sort({ impactScore: -1, createdAt: -1 }).limit(limit).toArray();
  return docs.map(d => ({ ...d, _id: String(d._id) }));
}
export async function supportIssue(issueId: string, user: SessionUser) {
  if (!ObjectId.isValid(issueId)) return { ok: false, error: "Invalid id" };
  const db = await getDb();
  const _id = new ObjectId(issueId);
  const ex = await db.collection("issues").findOne({ _id, supporterIds: user._id });
  if (ex) return { ok: false, error: "Already supporting" };
  await db.collection("issues").updateOne({ _id }, { $inc: { supporters: 1 }, $addToSet: { supporterIds: user._id }, $set: { updatedAt: new Date() } });
  await db.collection("issueVotes").insertOne({ issueId: _id, userId: user._id, at: new Date() });
  return { ok: true };
}