import type { VercelRequest, VercelResponse } from '@vercel/node'
import clientPromise from "../mongodb";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Check if MongoDB URI is configured
    if (!clientPromise) {
      return res.status(500).json({
        error: 'Database connection not configured'
      })
    }
    
    const client = await clientPromise;
    
    const db = client.db("atlas-blue-jacket");
    const collection = db.collection("sample_restaurants.neighborhoods");

    const documents = await collection.find({}).limit(10).toArray();

    return res.json(documents);
  } catch (error) {
    console.error('Database connection error:', error);
    return res.status(500).json({
      error: 'Failed to connect to database'
    })
  }
}
