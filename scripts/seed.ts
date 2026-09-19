import { MongoClient, ServerApiVersion } from "mongodb";
import "dotenv/config";
const uri = process.env.MONGODB_URI!;
if (!uri) throw new Error("MONGODB_URI required");
const client = new MongoClient(uri, { serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true } });
function R(b: string, n: string, f: number, d: string, dc: string, t: string, name: string) {
  return { buildingCode: b, roomNumber: n, displayName: `${b}-${n}`, floor: f, department: d, departmentCode: dc, roomType: t, roomName: name, verified: true, source: "official-campus-document", active: true };
}
const ROOMS = [
  R("B0","201",2,"Electrical & Electronics Engineering","EEE","CLASSROOM","Class Room"),
  R("B0","202",2,"Electrical & Electronics Engineering","EEE","SEMINAR","Seminar Hall"),
  R("B0","203",2,"Electrical & Electronics Engineering","EEE","CLASSROOM","Class Room"),
  R("B0","401",4,"Electrical & Electronics Engineering","EEE","CLASSROOM","Class Room"),
  R("B3","301",3,"Computer Science & Engineering","CSE","CLASSROOM","Class Room"),
  R("B3","302",3,"Computer Science & Engineering","CSE","CLASSROOM","Class Room"),
  R("B3","303",3,"Computer Science & Engineering","CSE","CLASSROOM","Class Room"),
  R("B4","101",1,"Information Technology","IT","LAB","Database Management Systems / Web Programming / Network Programming Lab"),
  R("B4","102",1,"Information Technology","IT","LAB","Data Structures / OOP Java / Computer Networks Lab"),
  R("B4","201",2,"Information Technology","IT","CLASSROOM","Class Room"),
  R("B4","202",2,"Information Technology","IT","CLASSROOM","Class Room"),
  R("B4","301",3,"Information Technology","IT","CLASSROOM","Class Room"),
  R("B4","302",3,"Information Technology","IT","CLASSROOM","Class Room"),
  R("B4","303",3,"Information Technology","IT","CLASSROOM","Class Room"),
  R("B4","304",3,"Information Technology","IT","CLASSROOM","Class Room"),
  R("B4","401",4,"Information Technology","IT","CLASSROOM","Class Room"),
  R("B4","402",4,"Information Technology","IT","CLASSROOM","Class Room"),
  R("B4","403",4,"Information Technology","IT","CLASSROOM","Class Room"),
  R("B7","202",2,"Electronics & Communication Engineering","ECE","CLASSROOM","Class Room"),
  R("B7","302",3,"Electronics & Communication Engineering","ECE","CLASSROOM","Class Room"),
  R("B7","303",3,"Electronics & Communication Engineering","ECE","CLASSROOM","Class Room"),
  R("B8","202",2,"Civil Engineering","CIVIL","CLASSROOM","Class Room"),
  R("B8","301",3,"Civil Engineering","CIVIL","SEMINAR","Seminar Hall"),
  R("B8","302",3,"Civil Engineering","CIVIL","CLASSROOM","Class Room"),
  R("B8","303",3,"Civil Engineering","CIVIL","CLASSROOM","Class Room"),
  R("B10","202",2,"Mechanical Engineering","MECH","CLASSROOM","Class Room"),
  R("B11","201",2,"Mechanical Engineering","MECH","CLASSROOM","Class Room"),
  R("B11","203",2,"Mechanical Engineering","MECH","MINI_AUDITORIUM","Mini Auditorium"),
  R("B12","201C",2,"Mechanical Engineering","MECH","CLASSROOM","Class Room"),
  R("B12","202",2,"Mechanical Engineering","MECH","CLASSROOM","Class Room"),
  R("B12","304",3,"Mechanical Engineering","MECH","SEMINAR","Seminar Hall"),
  R("B12","403",4,"Mechanical Engineering","MECH","CLASSROOM","Class Room")
];
const BUILDINGS = [
  { code: "B0", name: "EEE Block", floors: [1,2,3,4], active: true },
  { code: "B3", name: "CSE Block", floors: [1,2,3,4], active: true },
  { code: "B4", name: "IT Block", floors: [1,2,3,4], active: true },
  { code: "B7", name: "ECE Block", floors: [1,2,3,4], active: true },
  { code: "B8", name: "Civil Block", floors: [1,2,3,4], active: true },
  { code: "B10", name: "Mechanical Annex", floors: [1,2,3,4], active: true },
  { code: "B11", name: "Mechanical Block A", floors: [1,2,3,4], active: true },
  { code: "B12", name: "Mechanical Block B", floors: [1,2,3,4], active: true },
  { code: "ADMIN", name: "Administrative Block", floors: [1,2], active: true }
];
const PLACES = [
  { name: "Central Library", kind: "FACILITY", icon: "ðŸ“š", verified: true, active: true },
  { name: "Digital Library", kind: "FACILITY", icon: "ðŸ’»", verified: true, active: true },
  { name: "Main Auditorium", kind: "FACILITY", icon: "ðŸŽ¤", verified: true, active: true },
  { name: "Mini Auditorium", kind: "FACILITY", icon: "ðŸŽ¤", verified: true, active: true },
  { name: "Open-Air Auditorium", kind: "OUTDOOR", icon: "ðŸŽ™ï¸", verified: true, active: true },
  { name: "Canteen", kind: "FACILITY", icon: "ðŸ´", verified: true, active: true },
  { name: "Boys Hostel", kind: "HOSTEL", icon: "ðŸ ", verified: true, active: true },
  { name: "Girls Hostel", kind: "HOSTEL", icon: "ðŸ ", verified: true, active: true },
  { name: "Sports Ground", kind: "OUTDOOR", icon: "ðŸŸï¸", verified: true, active: true },
  { name: "Indoor Sports Complex", kind: "FACILITY", icon: "ðŸ¸", verified: true, active: true }
];
async function main() {
  await client.connect();
  const db = client.db("fixmycampus");
  await db.collection("buildings").createIndex({ code: 1 }, { unique: true });
  await db.collection("rooms").createIndex({ buildingCode: 1, roomNumber: 1 }, { unique: true });
  await db.collection("issues").createIndex({ "location.coordinates": "2dsphere" }, { sparse: true });
  await db.collection("issues").createIndex({ issueCode: 1 }, { unique: true });
  await db.collection("users").createIndex({ email: 1 }, { unique: true });
  await db.collection("buildings").bulkWrite(BUILDINGS.map(b => ({ updateOne: { filter: { code: b.code }, update: { $set: b }, upsert: true } })));
  await db.collection("rooms").bulkWrite(ROOMS.map(r => ({ updateOne: { filter: { buildingCode: r.buildingCode, roomNumber: r.roomNumber }, update: { $set: r }, upsert: true } })));
  await db.collection("campusPlaces").bulkWrite(PLACES.map(p => ({ updateOne: { filter: { name: p.name }, update: { $set: p }, upsert: true } })));
  console.log(`Seeded ${BUILDINGS.length} buildings, ${ROOMS.length} rooms, ${PLACES.length} campus places.`);
  await client.close();
}
main().catch(e => { console.error(e); process.exit(1); });