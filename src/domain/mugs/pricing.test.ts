import { describe, expect, it } from "vitest";
import { calculateBasketSummary, calculateUnitPrice, formatCurrency } from "./pricing";

describe("pricing", () => {
  it("calculates unit price using product, size, and design surcharges", () => {
    expect(calculateUnitPrice("nordic-dawn", "large", "berry-bloom")).toBe(30);
  });

  it("builds a basket summary including delivery cost", () => {
    const summary = calculateBasketSummary(
      [
        {
          id: "nordic-dawn:medium:sunrise-stripe",
          productId: "nordic-dawn",
          sizeId: "medium",
          designId: "sunrise-stripe",
          quantity: 2,
          addedAt: new Date().toISOString(),
        },
      ],
      "express",
    );

    expect(summary.itemCount).toBe(2);
    expect(summary.subtotal).toBe(44);
    expect(summary.deliveryCost).toBe(9);
    expect(summary.total).toBe(53);
  });

  it("formats prices as GBP values", () => {
    expect(formatCurrency(22)).toBe("£22");
  });
});