import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useBasketStore } from "@/store/basket-store";
import CheckoutSuccessPage from "./page";

describe("CheckoutSuccessPage", () => {
  beforeEach(() => {
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

  it("clears the basket when the success page mounts", async () => {
    render(<CheckoutSuccessPage />);

    await waitFor(() => {
      expect(useBasketStore.getState().items).toHaveLength(0);
      expect(useBasketStore.getState().deliveryOptionId).toBe("standard");
    });

    expect(
      screen.getByRole("heading", { name: /your demo mug order is in motion/i }),
    ).toBeInTheDocument();
  });
});