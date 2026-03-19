"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatCurrency } from "@/domain/mugs/pricing";
import { PersistedOrderRecord } from "@/domain/orders/types";
import { useBasketStore } from "@/store/basket-store";

export default function CheckoutSuccessPage() {
  const clearBasket = useBasketStore((state) => state.clearBasket);
  const [order, setOrder] = useState<PersistedOrderRecord | null>(null);
  const [isLoadingOrder, setIsLoadingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  useEffect(() => {
    const checkoutSessionId = new URLSearchParams(window.location.search).get("session_id");

    if (!checkoutSessionId) {
      return;
    }

    clearBasket();

    let isActive = true;
    const controller = new AbortController();

    const loadOrder = async () => {
      setIsLoadingOrder(true);
      setOrderError(null);

      for (let attempt = 0; attempt < 5; attempt += 1) {
        if (!isActive || controller.signal.aborted) {
          break;
        }

        try {
          const response = await fetch(
            `/api/orders/by-session/${encodeURIComponent(checkoutSessionId)}`,
            {
              cache: "no-store",
              signal: controller.signal,
            },
          );

          if (response.ok) {
            const data = (await response.json()) as { order: PersistedOrderRecord };

            if (isActive && !controller.signal.aborted) {
              setOrder(data.order);
              setIsLoadingOrder(false);
            }

            return;
          }

          if (response.status !== 404) {
            const data = (await response.json()) as { error?: string };

            if (isActive && !controller.signal.aborted) {
              setOrderError(data.error ?? "Unable to load your order details.");
              setIsLoadingOrder(false);
            }

            return;
          }
        } catch (error) {
          // Respect aborts and unmounts: do not update state if no longer active.
          if (!isActive || controller.signal.aborted) {
            return;
          }

          setOrderError("Unable to load your order details.");
          setIsLoadingOrder(false);
          return;
        }

        await new Promise((resolve) => {
          const timeoutId = setTimeout(resolve, 700);
          controller.signal.addEventListener(
            "abort",
            () => {
              clearTimeout(timeoutId);
              resolve(undefined);
            },
            { once: true },
          );
        });
      }

      if (isActive && !controller.signal.aborted) {
        setOrderError(
          "Payment succeeded, but order details are still syncing. Refresh in a few seconds.",
        );
        setIsLoadingOrder(false);
      }
    };

    void loadOrder();

    return () => {
      isActive = false;
      controller.abort();
    };
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

        {isLoadingOrder ? (
          <p className="mt-6 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-600">
            Confirming payment details from Stripe...
          </p>
        ) : null}

        {order ? (
          <section className="mt-6 rounded-2xl border border-stone-200 bg-stone-50 p-5 text-sm text-stone-700">
            <h2 className="text-lg font-semibold text-stone-900">Payment record</h2>
            <div className="mt-3 grid gap-2">
              <p>
                <span className="font-semibold text-stone-900">Session:</span>{" "}
                <span className="font-mono text-xs">{order.checkoutSessionId}</span>
              </p>
              <p>
                <span className="font-semibold text-stone-900">Status:</span> {order.paymentStatus}
              </p>
              <p>
                <span className="font-semibold text-stone-900">Total:</span>{" "}
                {formatCurrency(order.amountTotalMinor / 100)}
              </p>
              <p>
                <span className="font-semibold text-stone-900">Confirmed at:</span>{" "}
                {new Date(order.confirmedAt).toLocaleString()}
              </p>
              {order.customerEmail ? (
                <p>
                  <span className="font-semibold text-stone-900">Customer email:</span>{" "}
                  {order.customerEmail}
                </p>
              ) : null}
            </div>

            <div className="mt-4 space-y-2 border-t border-stone-200 pt-4">
              {order.lineItems.map((lineItem, index) => (
                <div
                  key={`${lineItem.description}-${lineItem.quantity}-${index}`}
                  className="flex items-center justify-between gap-3"
                >
                  <span>{lineItem.description}</span>
                  <span>
                    {lineItem.quantity} × {formatCurrency(lineItem.totalAmountMinor / 100 / lineItem.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {orderError ? (
          <p className="mt-6 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {orderError}
          </p>
        ) : null}

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