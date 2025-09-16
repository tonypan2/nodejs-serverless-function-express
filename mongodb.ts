import { MongoClient, MongoClientOptions } from "mongodb";
import { attachDatabasePool } from "@vercel/functions";

const uri = (() => {
  let res = process.env.MONGODB_URI!;
  if (res.indexOf("?") !== -1) {
    res = res.substring(0, res.indexOf("?")) + "?w=majority";
  }
  return res;
})();

const clients = new Map<string, MongoClient>();

export async function withClient<T>(
  params: MongoClientOptions & { attachDatabasePool?: boolean },
  callback: (client: MongoClient) => Promise<T>
): Promise<T> {
  const key = JSON.stringify(params);
  let client = clients.get(key);
  if (!client) {
    console.log("CREATE_MONGO_CLIENT:", uri, params);
    const { attachDatabasePool: attachDatabasePoolOption, ...options } = params;
    client = new MongoClient(uri, {
      appName: "devrel.vercel.integration",
      ...options,
    });
    if (attachDatabasePoolOption) {
      attachDatabasePool(client);
    }
    clients.set(key, client);
    await client.connect();
  }
  return await callback(client);
}
