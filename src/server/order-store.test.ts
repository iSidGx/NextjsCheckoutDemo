import path from "node:path";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  getOrdersByCustomerEmail,
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

  it("returns only orders matching the customer email sorted newest first", async () => {
    await upsertOrderRecord({
      id: "order_cs_test_a",
      checkoutSessionId: "cs_test_a",
      paymentStatus: "paid",
      amountTotalMinor: 1200,
      currency: "gbp",
      customerEmail: "buyer@example.com",
      deliveryOptionId: "standard",
      createdAt: "2026-03-19T10:00:00.000Z",
      confirmedAt: "2026-03-19T10:00:01.000Z",
      lineItems: [],
    });

    await upsertOrderRecord({
      id: "order_cs_test_b",
      checkoutSessionId: "cs_test_b",
      paymentStatus: "paid",
      amountTotalMinor: 1900,
      currency: "gbp",
      customerEmail: "other@example.com",
      deliveryOptionId: "express",
      createdAt: "2026-03-19T10:05:00.000Z",
      confirmedAt: "2026-03-19T10:05:01.000Z",
      lineItems: [],
    });

    await upsertOrderRecord({
      id: "order_cs_test_c",
      checkoutSessionId: "cs_test_c",
      paymentStatus: "paid",
      amountTotalMinor: 2200,
      currency: "gbp",
      customerEmail: "BUYER@example.com",
      deliveryOptionId: "express",
      createdAt: "2026-03-19T10:10:00.000Z",
      confirmedAt: "2026-03-19T10:10:01.000Z",
      lineItems: [],
    });

    const orders = await getOrdersByCustomerEmail("buyer@example.com");

    expect(orders).toHaveLength(2);
    expect(orders[0]?.checkoutSessionId).toBe("cs_test_c");
    expect(orders[1]?.checkoutSessionId).toBe("cs_test_a");
  });
});
