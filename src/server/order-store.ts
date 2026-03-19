import path from "node:path";
import { mkdir, readFile, writeFile, rename } from "node:fs/promises";
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
  } catch (error) {
    const err = error as NodeJS.ErrnoException;

    if (err && typeof err === "object" && err.code === "ENOENT") {
      // Treat missing file as an empty store.
      return [];
    }

    console.error("Failed to read orders from disk:", err);
    throw err;
  }
}

async function writeOrdersToDisk(orders: PersistedOrderRecord[]) {
  const storeFilePath = getOrderStoreFilePath();
  const directory = path.dirname(storeFilePath);

  await mkdir(directory, { recursive: true });

  const tempFilePath = `${storeFilePath}.tmp-${process.pid}-${Date.now()}`;
  const serialized = JSON.stringify(orders, null, 2);

  await writeFile(tempFilePath, serialized, "utf8");
  await rename(tempFilePath, storeFilePath);
}

let orderStoreQueue: Promise<unknown> = Promise.resolve();

function enqueueOrderStoreOperation<T>(operation: () => Promise<T>): Promise<T> {
  const result = orderStoreQueue.then(operation, operation);
  orderStoreQueue = result.then(
    () => undefined,
    () => undefined,
  );
  return result;
}

export async function upsertOrderRecord(order: PersistedOrderRecord) {
  return enqueueOrderStoreOperation(async () => {
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
  });
}

export async function getOrderRecordByCheckoutSessionId(checkoutSessionId: string) {
  const existingOrders = await readOrdersFromDisk();

  return existingOrders.find((entry) => entry.checkoutSessionId === checkoutSessionId) ?? null;
}
