import type { VercelRequest, VercelResponse } from "@vercel/node";
import { withClient } from "../mongodb";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const url = req.url || "/";
    const searchParams = new URLSearchParams(
      url.indexOf("?") !== -1 ? url.substring(url.indexOf("?") + 1) : ""
    );
    const config = searchParams.get("config") || "{}";
    const configObj = JSON.parse(config);

    const documents = await withClient(configObj, async (client) => {
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
