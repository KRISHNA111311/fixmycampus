import { MongoClient } from "mongodb";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function seedGVPCE() {
  if (!process.env.MONGODB_URI) throw new Error("Missing MONGODB_URI");
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();
    
    // 1. Setup GVPCE Madhurawada Campus Places
    const places = [
      { name: "Main Ground", kind: "OUTDOOR" },
      { name: "Basketball Court", kind: "OUTDOOR" },
      { name: "Tennis Court", kind: "OUTDOOR" },
      { name: "Boys Hostel - Main", kind: "HOSTEL" },
      { name: "Boys Hostel - Annex", kind: "HOSTEL" },
      { name: "Girls Hostel", kind: "HOSTEL" },
      { name: "Main Canteen", kind: "FACILITY" },
      { name: "Bakery / Fast Food Center", kind: "FACILITY" },
      { name: "Central Library", kind: "FACILITY" },
      { name: "Main Auditorium", kind: "FACILITY" },
      { name: "Student Parking Area", kind: "OUTDOOR" },
      { name: "Staff Parking Area", kind: "OUTDOOR" },
      { name: "Admin Block", kind: "BUILDING" }
    ];

    for (const p of places) {
      await db.collection("campusPlaces").updateOne(
        { name: p.name },
        { $set: { ...p, active: true, verified: true } },
        { upsert: true }
      );
    }

    // 2. Setup Buildings & Rooms (B0 through B11)
    const blocks = ["B0","B1","B2","B3","B4","B5","B6","B7","B8","B9","B10","B11"];
    
    for (const code of blocks) {
      // Register Building
      await db.collection("buildings").updateOne(
        { code: code },
        { $set: { code: code, active: true, floors: [1,2,3,4] } },
        { upsert: true }
      );

      // Register Rooms (101-105 up to 401-405)
      for (let floor = 1; floor <= 4; floor++) {
        for (let roomIdx = 1; roomIdx <= 5; roomIdx++) {
          const roomNumber = `${floor}0${roomIdx}`;
          await db.collection("rooms").updateOne(
            { buildingCode: code, roomNumber: roomNumber },
            { $set: { buildingCode: code, roomNumber: roomNumber, displayName: `${code}-${roomNumber}`, floor: floor, verified: true, active: true } },
            { upsert: true }
          );
        }
      }
    }
    
    console.log("Successfully seeded specific GVPCE places, hostels, grounds, and all B0-B11 rooms.");
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    await client.close();
  }
}
seedGVPCE();
