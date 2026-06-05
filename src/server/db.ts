import { Db, MongoClient } from "mongodb";

const DB_NAME = "mug-atelier";

let cachedUri: string | undefined;
let cachedClient: MongoClient | undefined;
let indexesEnsured = false;

async function ensureIndexes(db: Db): Promise<void> {
  if (indexesEnsured) return;
  indexesEnsured = true;

  await Promise.all([
    // users — unique email lookup
    db.collection("users").createIndex({ email: 1 }, { unique: true }),

    // orders — unique per Stripe checkout session
    db.collection("orders").createIndex({ checkoutSessionId: 1 }, { unique: true }),
    db.collection("orders").createIndex({ customerEmail: 1 }),

    // refresh_tokens — lookup paths + TTL auto-expiry
    db.collection("refresh_tokens").createIndex({ tokenIdHash: 1 }),
    db.collection("refresh_tokens").createIndex({ userId: 1 }),
    db
      .collection("refresh_tokens")
      .createIndex(
        { expiresAt: 1 },
        { expireAfterSeconds: 0, partialFilterExpression: { revokedAt: null } },
      ),
  ]);
}

/** Resets the cached connection — used in tests that create a new MongoMemoryServer. */
export function resetDbCache(): void {
  cachedUri = undefined;
  cachedClient = undefined;
  indexesEnsured = false;
}

/**
 * Returns a connected MongoDB Db instance.
 * The client is cached by URI so test suites that swap MONGODB_URI
 * automatically get a fresh connection to the new in-memory server.
 */
export async function getDb(): Promise<Db> {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("Missing MONGODB_URI environment variable.");
  }

  if (cachedClient && cachedUri === uri) {
    return cachedClient.db(DB_NAME);
  }

  if (cachedClient) {
    // URI changed (e.g. test suite swapping in-memory server) — reconnect.
    indexesEnsured = false;
    await cachedClient.close().catch(() => {});
  }

  cachedClient = new MongoClient(uri);
  await cachedClient.connect();
  cachedUri = uri;

  const db = cachedClient.db(DB_NAME);
  await ensureIndexes(db);
  return db;
}
