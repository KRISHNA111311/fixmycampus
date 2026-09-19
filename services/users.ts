import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import type { Role, SessionUser } from "@/types";
export async function findOrCreateUser(email: string, name?: string): Promise<SessionUser> {
  const db = await getDb();
  const col = db.collection("users");
  let doc = await col.findOne({ email });
  if (!doc) {
    const insert = { email, name: name ?? email.split("@")[0], role: "STUDENT" as Role, createdAt: new Date(), updatedAt: new Date() };
    const { insertedId } = await col.insertOne(insert);
    doc = { _id: insertedId, ...insert };
  } else if (name && name !== doc.name) {
    await col.updateOne({ _id: doc._id }, { $set: { name, updatedAt: new Date() } });
    doc.name = name;
  }
  return {
    _id: String(doc._id), email: doc.email, name: doc.name,
    role: doc.role, departmentCode: doc.departmentCode,
    createdAt: new Date(doc.createdAt).toISOString()
  };
}
export async function getUserById(id: string): Promise<SessionUser | null> {
  if (!ObjectId.isValid(id)) return null;
  const db = await getDb();
  const doc = await db.collection("users").findOne({ _id: new ObjectId(id) });
  if (!doc) return null;
  return {
    _id: String(doc._id), email: doc.email, name: doc.name,
    role: doc.role, departmentCode: doc.departmentCode,
    createdAt: new Date(doc.createdAt).toISOString()
  };
}