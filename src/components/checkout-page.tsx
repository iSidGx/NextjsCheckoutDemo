"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { deliveryOptions } from "@/domain/mugs/catalog";
import { calculateBasketSummary, formatCurrency } from "@/domain/mugs/pricing";
import { useBasketStore } from "@/store/basket-store";

export function CheckoutPage() {
  const items = useBasketStore((state) => state.items);
  const deliveryOptionId = useBasketStore((state) => state.deliveryOptionId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [isCanceled, setIsCanceled] = useState(false);
  const [address, setAddress] = useState({
    name: "",
    line1: "",
    line2: "",
    city: "",
    postcode: "",
    country: "GB",
  });
  const isAddressValid =
    address.name.trim().length > 0 &&
    address.line1.trim().length > 0 &&
    address.city.trim().length > 0 &&
    address.postcode.trim().length > 0;

  useEffect(() => {
    setIsCanceled(new URLSearchParams(window.location.search).get("canceled") === "1");
  }, []);

  async function handleStripeCheckout() {
    try {
      setIsSubmitting(true);
      setCheckoutError(null);

      const response = await fetch("/api/checkout/create-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items,
          deliveryOptionId,
          address,
        }),
      });

      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !data.url) {
        throw new Error(data.error ?? "Unable to start checkout right now.");
      }

      window.location.assign(data.url);
    } catch (error) {
      setCheckoutError(
        error instanceof Error ? error.message : "Unable to start checkout right now.",
      );
      setIsSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <main className="px-6 py-12 sm:px-8">
        <div className="mx-auto max-w-4xl rounded-[2rem] border border-dashed border-stone-300 bg-white/80 px-8 py-16 text-center shadow-sm">
          <h1 className="text-4xl text-stone-900">Your checkout is empty.</h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-stone-600">
            Add one or more mugs to your basket before continuing to checkout.
          </p>
          <Link
            href="/"
            className="mt-8 inline-flex rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-700"
          >
            Back to products
          </Link>
        </div>
      </main>
    );
  }

  const summary = calculateBasketSummary(items, deliveryOptionId);
  const selectedDelivery = deliveryOptions.find((option) => option.id === deliveryOptionId);

  return (
    <main className="px-6 py-12 sm:px-8">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_0.85fr]">
        <section className="rounded-[2rem] border border-stone-200/70 bg-white/90 p-6 shadow-[0_30px_90px_-50px_rgba(28,25,23,0.55)]">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-amber-700">
            Checkout summary
          </p>
          <h1 className="mt-3 text-5xl text-stone-900">Final review before confirmation.</h1>

          <div className="mt-8 border-t border-stone-100 pt-8">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-amber-700">
              Delivery address
            </p>
            <div className="mt-4 grid gap-3">
              <div>
                <label htmlFor="addr-name" className="block text-sm font-medium text-stone-700">
                  Full name
                </label>
                <input
                  id="addr-name"
                  type="text"
                  autoComplete="name"
                  value={address.name}
                  onChange={(e) => setAddress((a) => ({ ...a, name: e.target.value }))}
                  placeholder="Jane Smith"
                  className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
              </div>
              <div>
                <label htmlFor="addr-line1" className="block text-sm font-medium text-stone-700">
                  Address line 1
                </label>
                <input
                  id="addr-line1"
                  type="text"
                  autoComplete="address-line1"
                  value={address.line1}
                  onChange={(e) => setAddress((a) => ({ ...a, line1: e.target.value }))}
                  placeholder="12 Baker Street"
                  className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
              </div>
              <div>
                <label htmlFor="addr-line2" className="block text-sm font-medium text-stone-700">
                  Address line 2{" "}
                  <span className="font-normal text-stone-400">(optional)</span>
                </label>
                <input
                  id="addr-line2"
                  type="text"
                  autoComplete="address-line2"
                  value={address.line2}
                  onChange={(e) => setAddress((a) => ({ ...a, line2: e.target.value }))}
                  placeholder="Flat 3"
                  className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="addr-city" className="block text-sm font-medium text-stone-700">
                    City
                  </label>
                  <input
                    id="addr-city"
                    type="text"
                    autoComplete="address-level2"
                    value={address.city}
                    onChange={(e) => setAddress((a) => ({ ...a, city: e.target.value }))}
                    placeholder="London"
                    className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                  />
                </div>
                <div>
                  <label htmlFor="addr-postcode" className="block text-sm font-medium text-stone-700">
                    Postcode
                  </label>
                  <input
                    id="addr-postcode"
                    type="text"
                    autoComplete="postal-code"
                    value={address.postcode}
                    onChange={(e) => setAddress((a) => ({ ...a, postcode: e.target.value }))}
                    placeholder="SW1A 1AA"
                    className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="addr-country" className="block text-sm font-medium text-stone-700">
                  Country
                </label>
                <select
                  id="addr-country"
                  autoComplete="country"
                  value={address.country}
                  onChange={(e) => setAddress((a) => ({ ...a, country: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm text-stone-900 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                >
                  <option value="GB">United Kingdom</option>
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="AU">Australia</option>
                  <option value="IE">Ireland</option>
                  <option value="DE">Germany</option>
                  <option value="FR">France</option>
                  <option value="NL">Netherlands</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-stone-500">
              Order items
            </p>
            <div className="mt-4 space-y-4">
              {summary.items.map((item) => (
                <div
                  key={item.itemId}
                  className="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-xl text-stone-900">{item.productName}</h2>
                      <p className="mt-1 text-sm text-stone-600">
                        {item.designName} · {item.sizeLabel} · Qty {item.quantity}
                      </p>
                    </div>
                    <div className="text-right text-sm font-semibold text-stone-900">
                      <p>{formatCurrency(item.subtotal)}</p>
                      <p className="mt-1 text-xs font-medium text-stone-500">
                        {formatCurrency(item.unitPrice)} each
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className="h-fit rounded-[2rem] border border-stone-200/70 bg-stone-900 p-6 text-stone-50 shadow-[0_30px_90px_-50px_rgba(28,25,23,0.75)]">
          {isCanceled ? (
            <p className="mb-4 rounded-xl border border-amber-300/40 bg-amber-400/10 px-3 py-2 text-xs text-amber-100">
              Your payment was canceled. You can review and try checkout again.
            </p>
          ) : null}

          <h2 className="text-3xl">Order totals</h2>
          <div className="mt-6 space-y-3 text-sm text-stone-200">
            <div className="flex items-center justify-between">
              <span>Items subtotal</span>
              <span>{formatCurrency(summary.subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>{selectedDelivery?.label ?? "Delivery"}</span>
              <span>{formatCurrency(summary.deliveryCost)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Estimated delivery</span>
              <span>{selectedDelivery?.eta}</span>
            </div>
            <div className="flex items-center justify-between border-t border-stone-700 pt-3 text-base font-semibold text-white">
              <span>Total</span>
              <span>{formatCurrency(summary.total)}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleStripeCheckout}
            disabled={isSubmitting || !isAddressValid}
            className="mt-8 w-full rounded-full bg-amber-400 px-5 py-3 text-sm font-semibold text-stone-900 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Redirecting to secure checkout..." : "Pay securely (test mode)"}
          </button>
          {!isAddressValid && !isSubmitting ? (
            <p className="mt-2 text-center text-xs text-stone-400">
              Complete your delivery address to continue.
            </p>
          ) : null}
          {checkoutError ? (
            <p className="mt-3 rounded-xl border border-rose-300/40 bg-rose-400/10 px-3 py-2 text-xs text-rose-100">
              {checkoutError}
            </p>
          ) : null}
          <Link
            href="/basket"
            className="mt-3 inline-flex w-full items-center justify-center rounded-full border border-stone-600 px-5 py-3 text-sm font-semibold text-white transition hover:border-stone-400"
          >
            Back to basket
          </Link>
        </aside>
      </div>
    </main>
  );
}