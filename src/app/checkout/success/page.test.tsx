import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useBasketStore } from "@/store/basket-store";
import CheckoutSuccessPage from "./page";

describe("CheckoutSuccessPage", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/checkout/success?session_id=cs_test_123");

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          order: {
            id: "order_cs_test_123",
            checkoutSessionId: "cs_test_123",
            paymentStatus: "paid",
            amountTotalMinor: 3900,
            currency: "gbp",
            customerEmail: "buyer@example.com",
            deliveryOptionId: "standard",
            createdAt: "2026-03-19T10:00:00.000Z",
            confirmedAt: "2026-03-19T10:01:00.000Z",
            lineItems: [
              {
                description: "Nordic Dawn Mug",
                quantity: 1,
                totalAmountMinor: 3900,
                currency: "gbp",
              },
            ],
          },
        }),
      }),
    );

    useBasketStore.persist.clearStorage();
    useBasketStore.setState({
      items: [
        {
          id: "nordic-dawn:medium:sunrise-stripe",
          productId: "nordic-dawn",
          sizeId: "medium",
          designId: "sunrise-stripe",
          quantity: 2,
          addedAt: new Date().toISOString(),
        },
      ],
      deliveryOptionId: "express",
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("clears the basket when a checkout session id is present", async () => {
    render(<CheckoutSuccessPage />);

    await waitFor(() => {
      expect(useBasketStore.getState().items).toHaveLength(0);
      expect(useBasketStore.getState().deliveryOptionId).toBe("standard");
    });

    expect(
      screen.getByRole("heading", { name: /your demo mug order is in motion/i }),
    ).toBeInTheDocument();
  });

  it("keeps basket intact when no checkout session id is present", async () => {
    window.history.replaceState({}, "", "/checkout/success");

    render(<CheckoutSuccessPage />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /your demo mug order is in motion/i })).toBeInTheDocument();
    });

    expect(useBasketStore.getState().items).toHaveLength(1);
    expect(useBasketStore.getState().deliveryOptionId).toBe("express");
    expect(fetch).not.toHaveBeenCalled();
  });
});