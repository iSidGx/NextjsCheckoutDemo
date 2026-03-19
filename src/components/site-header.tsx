"use client";

import Link from "next/link";
import { useBasketStore } from "@/store/basket-store";

export function SiteHeader() {
  const itemCount = useBasketStore((state) =>
    state.items.reduce((total, item) => total + item.quantity, 0),
  );

  return (
    <header className="sticky top-0 z-20 border-b border-white/50 bg-[#fffaf4]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4 sm:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-stone-900 text-xs font-bold uppercase tracking-[0.32em] text-amber-200">
            MA
          </span>
          <span>
            <span className="block text-xs font-semibold uppercase tracking-[0.3em] text-amber-700">
              Retail demo
            </span>
            <span className="block text-xl text-stone-900">Mug Atelier</span>
          </span>
        </Link>
        <nav className="flex items-center gap-3 text-sm font-semibold text-stone-700">
          <Link
            href="/"
            className="rounded-full px-4 py-2 transition hover:bg-white hover:text-stone-900"
          >
            Products
          </Link>
          <Link
            href="/basket"
            className="rounded-full border border-stone-300 bg-white px-4 py-2 text-stone-900 transition hover:border-stone-500"
            aria-label={`Basket with ${itemCount} items`}
          >
            Basket
            <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-900">
              {itemCount}
            </span>
          </Link>
        </nav>
      </div>
    </header>
  );
}