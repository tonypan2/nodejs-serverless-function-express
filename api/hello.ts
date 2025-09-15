import type { VercelRequest, VercelResponse } from "@vercel/node";
import { withClient } from "../mongodb";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const documents = await withClient(async (client) => {
      const db = client.db("sample_restaurants");
      const collection = db.collection("neighborhoods");
      return collection.find({}).limit(10).toArray();
    });

    return res.json(documents);
  } catch (error) {
    console.error("Database connection error:", error);
    return res.status(500).json({
      error: "Failed to connect to database",
    });
  }
}
