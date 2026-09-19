import { MongoClient, ServerApiVersion, Db } from "mongodb";
const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI is not set");
declare global { var _mongoClientPromise: Promise<MongoClient> | undefined; }
const client = new MongoClient(uri, {
  serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true }
});
const clientPromise: Promise<MongoClient> =
  global._mongoClientPromise ?? (global._mongoClientPromise = client.connect());
export async function getDb(): Promise<Db> {
  const c = await clientPromise;
  return c.db("fixmycampus");
}
export async function ensureIndexes() {
  const db = await getDb();
  await Promise.all([
    db.collection("users").createIndex({ email: 1 }, { unique: true }),
    db.collection("otps").createIndex({ email: 1 }),
    db.collection("otps").createIndex({ createdAt: 1 }, { expireAfterSeconds: Number(process.env.OTP_TTL_SECONDS ?? 600) }),
    db.collection("buildings").createIndex({ code: 1 }, { unique: true }),
    db.collection("rooms").createIndex({ buildingCode: 1, roomNumber: 1 }, { unique: true }),
    db.collection("issues").createIndex({ "location.coordinates": "2dsphere" }, { sparse: true }),
    db.collection("issues").createIndex({ status: 1, severity: 1 }),
    db.collection("issues").createIndex({ createdAt: -1 }),
    db.collection("issues").createIndex({ issueCode: 1 }, { unique: true }),
    db.collection("auditLogs").createIndex({ at: -1 })
  ]);
}