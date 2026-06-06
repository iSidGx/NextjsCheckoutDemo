// @vitest-environment node
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { getDb, resetDbCache } from "./db";
import {
  getOrdersByCustomerEmail,
  getOrdersByUserId,
  getOrderRecordByCheckoutSessionId,
  upsertOrderRecord,
} from "./order-store";

describe("order-store", () => {
  let mongod: MongoMemoryServer;

  beforeAll(async () => {
    resetDbCache();
    mongod = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongod.getUri();
  });

  afterAll(async () => {
    delete process.env.MONGODB_URI;
    await mongod.stop();
  });

  beforeEach(async () => {
    const db = await getDb();
    await db.collection("orders").deleteMany({});
  });

  it("persists and fetches an order by checkout session id", async () => {
    await upsertOrderRecord({
      id: "order_cs_test_123",
      orderRef: "11000001",
      checkoutSessionId: "cs_test_123",
      paymentStatus: "paid",
      amountTotalMinor: 3900,
      currency: "gbp",
      customerEmail: "buyer@example.com",
      userId: "usr_1",
      deliveryAddress: null,
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
      orderRef: "11000002",
      checkoutSessionId: "cs_test_456",
      paymentStatus: "unpaid",
      amountTotalMinor: 2000,
      currency: "gbp",
      customerEmail: null,
      userId: null,
      deliveryAddress: null,
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
      orderRef: "11000002",
      checkoutSessionId: "cs_test_456",
      paymentStatus: "paid",
      amountTotalMinor: 2000,
      currency: "gbp",
      customerEmail: null,
      userId: null,
      deliveryAddress: null,
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

  it("returns only orders matching the user id sorted newest first", async () => {
    await upsertOrderRecord({
      id: "order_cs_test_a",
      orderRef: "11000003",
      checkoutSessionId: "cs_test_a",
      paymentStatus: "paid",
      amountTotalMinor: 1200,
      currency: "gbp",
      customerEmail: "buyer@example.com",
      userId: "usr_buyer",
      deliveryAddress: null,
      deliveryOptionId: "standard",
      createdAt: "2026-03-19T10:00:00.000Z",
      confirmedAt: "2026-03-19T10:00:01.000Z",
      lineItems: [],
    });

    await upsertOrderRecord({
      id: "order_cs_test_b",
      orderRef: "11000004",
      checkoutSessionId: "cs_test_b",
      paymentStatus: "paid",
      amountTotalMinor: 1900,
      currency: "gbp",
      customerEmail: "other@example.com",
      userId: "usr_other",
      deliveryAddress: null,
      deliveryOptionId: "express",
      createdAt: "2026-03-19T10:05:00.000Z",
      confirmedAt: "2026-03-19T10:05:01.000Z",
      lineItems: [],
    });

    await upsertOrderRecord({
      id: "order_cs_test_c",
      orderRef: "11000005",
      checkoutSessionId: "cs_test_c",
      paymentStatus: "paid",
      amountTotalMinor: 2200,
      currency: "gbp",
      customerEmail: "buyer@example.com",
      userId: "usr_buyer",
      deliveryAddress: null,
      deliveryOptionId: "express",
      createdAt: "2026-03-19T10:10:00.000Z",
      confirmedAt: "2026-03-19T10:10:01.000Z",
      lineItems: [],
    });

    const orders = await getOrdersByUserId("usr_buyer");

    expect(orders).toHaveLength(2);
    expect(orders[0]?.checkoutSessionId).toBe("cs_test_c");
    expect(orders[1]?.checkoutSessionId).toBe("cs_test_a");
  });

  it("returns only orders matching the customer email sorted newest first", async () => {
    await upsertOrderRecord({
      id: "order_email_a",
      orderRef: "11000006",
      checkoutSessionId: "cs_email_a",
      paymentStatus: "paid",
      amountTotalMinor: 1200,
      currency: "gbp",
      customerEmail: "buyer@example.com",
      userId: "usr_buyer",
      deliveryAddress: null,
      deliveryOptionId: "standard",
      createdAt: "2026-03-19T10:00:00.000Z",
      confirmedAt: "2026-03-19T10:00:01.000Z",
      lineItems: [],
    });

    await upsertOrderRecord({
      id: "order_email_b",
      orderRef: "11000007",
      checkoutSessionId: "cs_email_b",
      paymentStatus: "paid",
      amountTotalMinor: 1900,
      currency: "gbp",
      customerEmail: "other@example.com",
      userId: "usr_other",
      deliveryAddress: null,
      deliveryOptionId: "express",
      createdAt: "2026-03-19T10:05:00.000Z",
      confirmedAt: "2026-03-19T10:05:01.000Z",
      lineItems: [],
    });

    await upsertOrderRecord({
      id: "order_email_c",
      orderRef: "11000008",
      checkoutSessionId: "cs_email_c",
      paymentStatus: "paid",
      amountTotalMinor: 2200,
      currency: "gbp",
      customerEmail: "BUYER@example.com",
      userId: "usr_buyer",
      deliveryAddress: null,
      deliveryOptionId: "express",
      createdAt: "2026-03-19T10:10:00.000Z",
      confirmedAt: "2026-03-19T10:10:01.000Z",
      lineItems: [],
    });

    const orders = await getOrdersByCustomerEmail("buyer@example.com");

    expect(orders).toHaveLength(2);
    expect(orders[0]?.checkoutSessionId).toBe("cs_email_c");
    expect(orders[1]?.checkoutSessionId).toBe("cs_email_a");
  });
});
