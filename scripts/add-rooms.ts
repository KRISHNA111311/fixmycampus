import { MongoClient } from "mongodb";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function safelyAddRooms() {
  if (!process.env.MONGODB_URI) throw new Error("Missing MONGODB_URI in .env.local");
  
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();
    const collection = db.collection("locations"); 
    
    const floors = [1, 2, 3, 4];
    const roomsPerFloor = 5; 

    // Find existing buildings, or create default blocks if none exist
    const blocks = await collection.distinct("building");
    if (blocks.length === 0) blocks.push("Main Block", "Science Block");

    let added = 0;
    for (const block of blocks) {
      for (const floor of floors) {
        for (let i = 1; i <= roomsPerFloor; i++) {
          const roomNumber = `${floor}0${i}`;
          
          // upsert: true ensures it only adds the room if it doesn't already exist
          const result = await collection.updateOne(
            { building: block, room: roomNumber },
            { $set: { building: block, room: roomNumber } },
            { upsert: true }
          );
          if (result.upsertedCount > 0) added++;
        }
      }
    }
    
    console.log(`Update complete. Safely added ${added} new rooms across ${blocks.length} blocks.`);
    process.exit(0);
  } catch (error) {
    console.error("Database error:", error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

safelyAddRooms();
