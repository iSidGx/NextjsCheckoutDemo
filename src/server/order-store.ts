import path from "node:path";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { PersistedOrderRecord } from "@/domain/orders/types";

function getOrderStoreFilePath() {
  return process.env.ORDER_STORE_FILE ?? path.join(process.cwd(), "data", "orders.json");
}

async function readOrdersFromDisk() {
  try {
    const storeFilePath = getOrderStoreFilePath();
    const raw = await readFile(storeFilePath, "utf8");
    const parsed = JSON.parse(raw) as PersistedOrderRecord[];

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed;
  } catch {
    return [];
  }
}

async function writeOrdersToDisk(orders: PersistedOrderRecord[]) {
  const storeFilePath = getOrderStoreFilePath();
  const directory = path.dirname(storeFilePath);

  await mkdir(directory, { recursive: true });
  await writeFile(storeFilePath, JSON.stringify(orders, null, 2), "utf8");
}

export async function upsertOrderRecord(order: PersistedOrderRecord) {
  const existingOrders = await readOrdersFromDisk();
  const matchingIndex = existingOrders.findIndex(
    (entry) => entry.checkoutSessionId === order.checkoutSessionId,
  );

  if (matchingIndex >= 0) {
    existingOrders[matchingIndex] = order;
  } else {
    existingOrders.unshift(order);
  }

  await writeOrdersToDisk(existingOrders);

  return order;
}

export async function getOrderRecordByCheckoutSessionId(checkoutSessionId: string) {
  const existingOrders = await readOrdersFromDisk();

  return existingOrders.find((entry) => entry.checkoutSessionId === checkoutSessionId) ?? null;
}
