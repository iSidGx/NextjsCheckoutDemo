import path from "node:path";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  getOrderRecordByCheckoutSessionId,
  upsertOrderRecord,
} from "./order-store";

describe("order-store", () => {
  let tempDirectory = "";

  beforeEach(async () => {
    tempDirectory = await mkdtemp(path.join(tmpdir(), "mug-orders-"));
    process.env.ORDER_STORE_FILE = path.join(tempDirectory, "orders.json");
  });

  afterEach(async () => {
    delete process.env.ORDER_STORE_FILE;

    if (tempDirectory) {
      await rm(tempDirectory, { recursive: true, force: true });
    }
  });

  it("persists and fetches an order by checkout session id", async () => {
    await upsertOrderRecord({
      id: "order_cs_test_123",
      checkoutSessionId: "cs_test_123",
      paymentStatus: "paid",
      amountTotalMinor: 3900,
      currency: "gbp",
      customerEmail: "buyer@example.com",
      deliveryOptionId: "express",
      createdAt: "2026-03-19T10:00:00.000Z",
      confirmedAt: "2026-03-19T10:00:02.000Z",
      lineItems: [
        {
          description: "Nordic Dawn Mug · Sunrise Stripe · Medium",
          quantity: 2,
          totalAmountMinor: 4400,
          currency: "gbp",
        },
      ],
    });

    const order = await getOrderRecordByCheckoutSessionId("cs_test_123");

    expect(order).not.toBeNull();
    expect(order?.checkoutSessionId).toBe("cs_test_123");
    expect(order?.amountTotalMinor).toBe(3900);
  });

  it("upserts the same checkout session instead of duplicating records", async () => {
    await upsertOrderRecord({
      id: "order_cs_test_456",
      checkoutSessionId: "cs_test_456",
      paymentStatus: "unpaid",
      amountTotalMinor: 2000,
      currency: "gbp",
      customerEmail: null,
      deliveryOptionId: "standard",
      createdAt: "2026-03-19T10:00:00.000Z",
      confirmedAt: "2026-03-19T10:00:02.000Z",
      lineItems: [
        {
          description: "Cafe Cloud Mug · Atelier Grid · Large",
          quantity: 1,
          totalAmountMinor: 2000,
          currency: "gbp",
        },
      ],
    });

    await upsertOrderRecord({
      id: "order_cs_test_456",
      checkoutSessionId: "cs_test_456",
      paymentStatus: "paid",
      amountTotalMinor: 2000,
      currency: "gbp",
      customerEmail: null,
      deliveryOptionId: "standard",
      createdAt: "2026-03-19T10:00:00.000Z",
      confirmedAt: "2026-03-19T10:05:02.000Z",
      lineItems: [
        {
          description: "Cafe Cloud Mug · Atelier Grid · Large",
          quantity: 1,
          totalAmountMinor: 2000,
          currency: "gbp",
        },
      ],
    });

    const order = await getOrderRecordByCheckoutSessionId("cs_test_456");

    expect(order).not.toBeNull();
    expect(order?.paymentStatus).toBe("paid");
    expect(order?.confirmedAt).toBe("2026-03-19T10:05:02.000Z");
  });
});
