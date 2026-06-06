import { randomInt } from "node:crypto";
import { PersistedOrderRecord } from "@/domain/orders/types";
import { getDb } from "@/server/db";

/** Generates a unique 8-digit numeric order reference (10000000–99999999). */
export function generateOrderRef(): string {
  return String(randomInt(10000000, 100000000));
}

async function ordersCollection() {
  const db = await getDb();
  return db.collection<PersistedOrderRecord>("orders");
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function upsertOrderRecord(order: PersistedOrderRecord): Promise<PersistedOrderRecord> {
  const col = await ordersCollection();
  // Destructure into fields that are set once (on insert) vs fields that may
  // change on a Stripe webhook re-delivery (e.g. paymentStatus update).
  const { checkoutSessionId, id, orderRef, createdAt, ...mutableFields } = order;

  await col.updateOne(
    { checkoutSessionId },
    {
      $set: mutableFields,
      $setOnInsert: { id, checkoutSessionId, orderRef, createdAt },
    },
    { upsert: true },
  );
  return order;
}

export async function getOrderRecordByCheckoutSessionId(
  checkoutSessionId: string,
): Promise<PersistedOrderRecord | null> {
  const col = await ordersCollection();
  const doc = await col.findOne({ checkoutSessionId }, { projection: { _id: 0 } });
  return doc as PersistedOrderRecord | null;
}

export async function getOrdersByUserId(
  userId: string,
): Promise<PersistedOrderRecord[]> {
  const col = await ordersCollection();
  const docs = await col
    .find({ userId }, { projection: { _id: 0 } })
    .sort({ confirmedAt: -1 })
    .toArray();
  return docs as PersistedOrderRecord[];
}

export async function getOrdersByCustomerEmail(
  customerEmail: string,
): Promise<PersistedOrderRecord[]> {
  const col = await ordersCollection();
  const normalizedEmail = customerEmail.trim().toLowerCase();
  const docs = await col
    .find(
      { customerEmail: { $regex: `^${escapeRegex(normalizedEmail)}$`, $options: "i" } },
      { projection: { _id: 0 } },
    )
    .sort({ confirmedAt: -1 })
    .toArray();
  return docs as PersistedOrderRecord[];
}
