import { MugProduct } from "./types";

export function filterProducts(products: MugProduct[], rawQuery: string) {
  const query = rawQuery.trim().toLowerCase();

  if (!query) {
    return products;
  }

  return products.filter((product) => {
    const haystack = [
      product.name,
      product.description,
      product.material,
      product.finish,
      ...product.tags,
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(query);
  });
}