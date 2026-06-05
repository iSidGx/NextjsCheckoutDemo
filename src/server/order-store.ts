import { PersistedOrderRecord } from "@/domain/orders/types";
import { getDb } from "@/server/db";

async function ordersCollection() {
  const db = await getDb();
  return db.collection<PersistedOrderRecord>("orders");
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function upsertOrderRecord(order: PersistedOrderRecord): Promise<PersistedOrderRecord> {
  const col = await ordersCollection();
  await col.replaceOne(
    { checkoutSessionId: order.checkoutSessionId },
    order,
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
