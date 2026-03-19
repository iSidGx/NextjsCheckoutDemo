"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useBasketStore } from "@/store/basket-store";

export default function CheckoutSuccessPage() {
  const clearBasket = useBasketStore((state) => state.clearBasket);

  useEffect(() => {
    clearBasket();
  }, [clearBasket]);

  return (
    <main className="px-6 py-12 sm:px-8">
      <div className="mx-auto max-w-3xl rounded-[2rem] border border-stone-200/70 bg-white/90 p-8 shadow-[0_30px_90px_-50px_rgba(28,25,23,0.55)] backdrop-blur">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-amber-700">
          Order confirmed
        </p>
        <h1 className="mt-4 text-4xl text-stone-900 sm:text-5xl">
          Your demo mug order is in motion.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-stone-600">
          This confirmation page is part of the demo flow. In a production build,
          this would be backed by a payment and fulfillment pipeline.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/"
            className="rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold !text-white transition hover:bg-stone-700"
          >
            Continue shopping
          </Link>
          <Link
            href="/basket"
            className="rounded-full border border-stone-300 px-5 py-3 text-sm font-semibold text-stone-700 transition hover:border-stone-500 hover:text-stone-900"
          >
            View basket
          </Link>
        </div>
      </div>
    </main>
  );
}