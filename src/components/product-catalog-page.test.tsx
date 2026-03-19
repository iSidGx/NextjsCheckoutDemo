import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { mugProducts } from "@/domain/mugs/catalog";
import { useBasketStore } from "@/store/basket-store";
import { ProductCatalogPage } from "./product-catalog-page";

describe("ProductCatalogPage", () => {
  beforeEach(() => {
    useBasketStore.persist.clearStorage();
    useBasketStore.setState({ items: [], deliveryOptionId: "standard" });
  });

  it("filters products and updates the basket count when an item is added", async () => {
    const user = userEvent.setup();

    render(<ProductCatalogPage />);

    await user.type(screen.getByLabelText(/search mugs/i), "porcelain");

    expect(screen.getByText(/showing/i)).toHaveTextContent(
      `Showing 1 of ${mugProducts.length} products`,
    );
    expect(screen.getByRole("heading", { name: /cafe cloud mug/i })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /add to basket/i }));

    expect(screen.getByRole("link", { name: /basket \(1\)/i })).toBeInTheDocument();
  });
});