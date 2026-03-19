import { describe, expect, it } from "vitest";
import { mugProducts } from "./catalog";
import { filterProducts } from "./search";

describe("filterProducts", () => {
  it("returns all products for an empty query", () => {
    expect(filterProducts(mugProducts, "")).toHaveLength(mugProducts.length);
  });

  it("matches by material, finish, and tags", () => {
    expect(filterProducts(mugProducts, "porcelain").map((product) => product.id)).toEqual([
      "cafe-cloud",
    ]);
    expect(filterProducts(mugProducts, "textured").map((product) => product.id)).toEqual([
      "campfire-clay",
    ]);
    expect(filterProducts(mugProducts, "gift").map((product) => product.id)).toEqual([
      "cafe-cloud",
    ]);
  });
});