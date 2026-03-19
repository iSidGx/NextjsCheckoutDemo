import { beforeEach, describe, expect, it } from "vitest";
import { useBasketStore } from "./basket-store";

describe("useBasketStore", () => {
  beforeEach(() => {
    useBasketStore.persist.clearStorage();
    useBasketStore.setState({ items: [], deliveryOptionId: "standard" });
  });

  it("adds an item to the basket", () => {
    useBasketStore.getState().addItem("nordic-dawn", {
      sizeId: "medium",
      designId: "sunrise-stripe",
      quantity: 2,
    });

    expect(useBasketStore.getState().items).toHaveLength(1);
    expect(useBasketStore.getState().items[0]?.quantity).toBe(2);
  });

  it("merges identical customizations instead of adding duplicate lines", () => {
    const store = useBasketStore.getState();

    store.addItem("nordic-dawn", {
      sizeId: "medium",
      designId: "sunrise-stripe",
      quantity: 2,
    });
    store.addItem("nordic-dawn", {
      sizeId: "medium",
      designId: "sunrise-stripe",
      quantity: 3,
    });

    expect(useBasketStore.getState().items).toHaveLength(1);
    expect(useBasketStore.getState().items[0]?.quantity).toBe(5);
  });

  it("updates quantities and delivery option", () => {
    const store = useBasketStore.getState();

    store.addItem("cafe-cloud", {
      sizeId: "large",
      designId: "atelier-grid",
      quantity: 1,
    });

    store.updateQuantity("cafe-cloud:large:atelier-grid", 4);
    store.selectDeliveryOption("express");

    expect(useBasketStore.getState().items[0]?.quantity).toBe(4);
    expect(useBasketStore.getState().deliveryOptionId).toBe("express");
  });
});