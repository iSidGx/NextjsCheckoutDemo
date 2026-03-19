"use client";

import Link from "next/link";
import { deliveryOptions, mugDesigns, mugProducts, mugSizes } from "@/domain/mugs/catalog";
import { calculateBasketSummary, formatCurrency } from "@/domain/mugs/pricing";
import { useBasketStore } from "@/store/basket-store";
import { QuantityStepper } from "./quantity-stepper";

export function BasketPage() {
  const items = useBasketStore((state) => state.items);
  const deliveryOptionId = useBasketStore((state) => state.deliveryOptionId);
  const updateQuantity = useBasketStore((state) => state.updateQuantity);
  const removeItem = useBasketStore((state) => state.removeItem);
  const selectDeliveryOption = useBasketStore((state) => state.selectDeliveryOption);

  const summary = calculateBasketSummary(items, deliveryOptionId);

  if (items.length === 0) {
    return (
      <main className="px-6 py-12 sm:px-8">
        <div className="mx-auto max-w-4xl rounded-[2rem] border border-dashed border-stone-300 bg-white/80 px-8 py-16 text-center shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-stone-500">
            Your basket is empty
          </p>
          <h1 className="mt-4 text-4xl text-stone-900">Start with a mug from the product catalog.</h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-stone-600">
            Choose a mug, select one of the predefined designs, pick a size, and add it here.
          </p>
          <Link
            href="/"
            className="mt-8 inline-flex rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold !text-white transition hover:bg-stone-700"
          >
            Browse products
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="px-6 py-12 sm:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <section>
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-amber-700">
            Basket
          </p>
          <h1 className="mt-3 text-5xl text-stone-900">Review your mug selections.</h1>
          <div className="mt-8 grid gap-5">
            {items.map((item) => {
              const product = mugProducts.find((entry) => entry.id === item.productId);
              const design = mugDesigns.find((entry) => entry.id === item.designId);
              const size = mugSizes.find((entry) => entry.id === item.sizeId);

              if (!product || !design || !size) {
                return null;
              }

              return (
                <article
                  key={item.id}
                  className="grid gap-4 rounded-[2rem] border border-stone-200/70 bg-white/90 p-5 shadow-[0_20px_60px_-45px_rgba(28,25,23,0.48)] sm:grid-cols-[1fr_auto] sm:items-center"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-2xl text-stone-900">{product.name}</h2>
                      <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-stone-600">
                        {size.label}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-stone-600">
                      Design: <strong className="text-stone-900">{design.name}</strong>
                    </p>
                    <p className="mt-1 text-sm text-stone-600">
                      Unit price: {formatCurrency(summary.items.find((line) => line.itemId === item.id)?.unitPrice ?? 0)}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 sm:justify-end">
                    <QuantityStepper
                      id={`basket-quantity-${item.id}`}
                      value={item.quantity}
                      onChange={(value) => updateQuantity(item.id, value)}
                    />
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="rounded-full border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-stone-500 hover:text-stone-900"
                    >
                      Remove
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <aside className="h-fit rounded-[2rem] border border-stone-200/70 bg-white/90 p-6 shadow-[0_25px_70px_-45px_rgba(28,25,23,0.55)]">
          <h2 className="text-3xl text-stone-900">Delivery</h2>
          <div className="mt-6 grid gap-3">
            {deliveryOptions.map((option) => (
              <label
                key={option.id}
                className={`rounded-2xl border p-4 transition ${
                  option.id === deliveryOptionId
                    ? "border-stone-900 bg-stone-900 text-white"
                    : "border-stone-200 bg-stone-50 text-stone-800 hover:border-stone-400"
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="delivery-option"
                    value={option.id}
                    checked={option.id === deliveryOptionId}
                    onChange={() => selectDeliveryOption(option.id)}
                    className="mt-1"
                  />
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold">{option.label}</span>
                      <span className="text-xs opacity-80">{option.eta}</span>
                    </div>
                    <p className="mt-1 text-sm opacity-85">{formatCurrency(option.price)}</p>
                  </div>
                </div>
              </label>
            ))}
          </div>

          <div className="mt-8 space-y-3 border-t border-stone-200 pt-6 text-sm text-stone-700">
            <div className="flex items-center justify-between">
              <span>Items</span>
              <span>{summary.itemCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <span>{formatCurrency(summary.subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Delivery</span>
              <span>{formatCurrency(summary.deliveryCost)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-stone-200 pt-3 text-base font-semibold text-stone-900">
              <span>Total</span>
              <span>{formatCurrency(summary.total)}</span>
            </div>
          </div>

          <Link
            href="/checkout"
            className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-amber-500 px-5 py-3 text-sm font-semibold text-stone-900 transition hover:bg-amber-400"
          >
            Continue to checkout
          </Link>
        </aside>
      </div>
    </main>
  );
}