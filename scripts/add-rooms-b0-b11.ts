import { MongoClient } from "mongodb";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function seedRoomsB0toB11() {
  if (!process.env.MONGODB_URI) throw new Error("Missing MONGODB_URI in .env.local");
  
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();
    
    // The collection used in lib/mongodb.ts and docs is "rooms"
    const collection = db.collection("rooms"); 
    
    const blocks = ["B0","B1","B2","B3","B4","B5","B6","B7","B8","B9","B10","B11"];
    
    let added = 0;
    
    for (const block of blocks) {
      // For each floor 1 to 4
      for (let floor = 1; floor <= 4; floor++) {
        // Rooms 01 to 05
        for (let roomIdx = 1; roomIdx <= 5; roomIdx++) {
          const roomNumber = `${floor}0${roomIdx}`;
          
          const roomDoc = {
            buildingCode: block,
            roomNumber: roomNumber,
            displayName: `${block}-${roomNumber}`,
            floor: floor,
            verified: true,
            active: true,
            source: "batch-update"
          };
          
          // upsert: true ensures it only adds the room if it doesn't already exist
          const result = await collection.updateOne(
            { buildingCode: block, roomNumber: roomNumber },
            { $setOnInsert: roomDoc },
            { upsert: true }
          );
          
          if (result.upsertedCount > 0) added++;
        }
      }
    }
    
    console.log(`Update complete. Safely added ${added} new rooms for blocks B0 through B11.`);
    process.exit(0);
  } catch (error) {
    console.error("Database error:", error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

seedRoomsB0toB11();
