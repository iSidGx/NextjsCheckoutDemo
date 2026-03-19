"use client";

import Link from "next/link";
import { useDeferredValue, useState } from "react";
import { mugProducts } from "@/domain/mugs/catalog";
import { filterProducts } from "@/domain/mugs/search";
import { useBasketStore } from "@/store/basket-store";
import { ProductCard } from "./product-card";

export function ProductCatalogPage() {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const filteredProducts = filterProducts(mugProducts, deferredQuery);
  const itemCount = useBasketStore((state) =>
    state.items.reduce((total, item) => total + item.quantity, 0),
  );

  return (
    <main className="px-6 pb-16 pt-8 sm:px-8">
      <section className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-amber-700">
            Custom mug retailer
          </p>
          <h1 className="mt-4 max-w-3xl text-5xl leading-[1.05] text-stone-900 sm:text-6xl">
            Build a basket of custom mugs with live design previews.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-stone-600 sm:text-lg">
            Browse different mug styles, choose from predefined artwork, pick a size,
            adjust quantity, and move through basket and checkout in a demo-ready flow.
          </p>
        </div>

        <div className="rounded-[2rem] border border-stone-200/70 bg-white/85 p-6 shadow-[0_30px_80px_-50px_rgba(28,25,23,0.48)] backdrop-blur">
          <label htmlFor="product-search" className="text-sm font-semibold text-stone-900">
            Search mugs
          </label>
          <input
            id="product-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by mug name, material, finish, or tag"
            className="mt-3 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-amber-500 focus:bg-white"
          />
          <div className="mt-5 flex items-center justify-between gap-4 text-sm text-stone-600">
            <span>
              Showing <strong className="text-stone-900">{filteredProducts.length}</strong> of {mugProducts.length} products
            </span>
            <Link href="/basket" className="font-semibold text-stone-900 underline decoration-amber-400 underline-offset-4">
              Basket ({itemCount})
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-12 max-w-7xl">
        {filteredProducts.length > 0 ? (
          <div className="grid gap-8">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-[2rem] border border-dashed border-stone-300 bg-white/70 px-8 py-16 text-center shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-stone-500">
              No mugs matched
            </p>
            <h2 className="mt-4 text-3xl text-stone-900">Try a different search term.</h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-stone-600">
              Search by material, finish, or descriptive tags like matte, gift, tea, or office.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}