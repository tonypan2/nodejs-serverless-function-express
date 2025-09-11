import { MongoClient, MongoClientOptions } from 'mongodb';
import { attachDatabasePool } from '@vercel/functions';

const uri = process.env.MONGODB_URI;
const options: MongoClientOptions = {
  appName: "devrel.vercel.integration",
};

let client: MongoClient;
let clientPromise: Promise<MongoClient> | null = null;

if (uri) {
  if (process.env.NODE_ENV === 'development') {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    const globalWithMongo = global as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient>;
      _mongoClient?: MongoClient;
    };

    if (!globalWithMongo._mongoClientPromise) {
      client = new MongoClient(uri, options);
      globalWithMongo._mongoClient = client;
      globalWithMongo._mongoClientPromise = client.connect();
      
      // Attach the client to ensure proper cleanup on function suspension
      attachDatabasePool(client);
    }
    clientPromise = globalWithMongo._mongoClientPromise;
  } else {
    // In production mode, it's best to not use a global variable.
    client = new MongoClient(uri, options);
    
    // Attach the client to ensure proper cleanup on function suspension
    attachDatabasePool(client);
    
    clientPromise = client.connect();
  }
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise; 