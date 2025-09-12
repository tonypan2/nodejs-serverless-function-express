import { MongoClient, MongoClientOptions } from "mongodb";
import { attachDatabasePool } from "@vercel/functions";

const uri = process.env.MONGODB_URI;
const options: MongoClientOptions = {
  appName: "devrel.vercel.integration",
  maxIdleTimeMS: 60_000,
};

let client: MongoClient;

if (uri) {
  if (process.env.NODE_ENV === "development") {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    const globalWithMongo = global as typeof globalThis & {
      _mongoClient?: MongoClient;
    };

    if (!globalWithMongo._mongoClient) {
      client = new MongoClient(uri, options);
      globalWithMongo._mongoClient = client;

      // Attach the client to ensure proper cleanup on function suspension
      attachDatabasePool(client);
    }
  } else {
    // In production mode, it's best to not use a global variable.
    client = new MongoClient(uri, options);

    // Attach the client to ensure proper cleanup on function suspension
    attachDatabasePool(client);
  }
}

export async function withClient<T>(
  callback: (client: MongoClient) => Promise<T>
): Promise<T> {
  const connection = await client.connect();
  try {
    return await callback(connection);
  } finally {
    connection.close();
  }
}
