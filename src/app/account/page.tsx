"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PersistedOrderRecord } from "@/domain/orders/types";
import { formatCurrency } from "@/domain/mugs/pricing";
import { fetchWithAuthRetry } from "@/lib/auth-client";

interface SessionUser {
  id: string;
  email: string;
  name: string;
}

export default function AccountPage() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [orders, setOrders] = useState<PersistedOrderRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    let isActive = true;

    const loadAccount = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const meResponse = await fetchWithAuthRetry("/api/auth/me");

        if (meResponse.status === 401) {
          window.location.assign("/login");
          return;
        }

        if (!meResponse.ok) {
          setError("Unable to load account details.");
          setIsLoading(false);
          return;
        }

        const meData = (await meResponse.json()) as { user: SessionUser };

        if (!isActive) {
          return;
        }

        setUser(meData.user);

        const ordersResponse = await fetchWithAuthRetry("/api/orders/mine");

        if (!ordersResponse.ok) {
          setError("Unable to load your order history.");
          setIsLoading(false);
          return;
        }

        const ordersData = (await ordersResponse.json()) as { orders: PersistedOrderRecord[] };

        if (!isActive) {
          return;
        }

        setOrders(ordersData.orders);
      } catch {
        if (isActive) {
          setError("Unable to load account details.");
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadAccount();

    return () => {
      isActive = false;
    };
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.assign("/login");
    } catch {
      setError("Unable to log out right now.");
      setIsLoggingOut(false);
    }
  };

  return (
    <main className="px-6 py-12 sm:px-8">
      <div className="mx-auto max-w-4xl rounded-[2rem] border border-stone-200/70 bg-white/90 p-8 shadow-[0_30px_90px_-50px_rgba(28,25,23,0.55)] backdrop-blur">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-amber-700">Your account</p>
        <h1 className="mt-4 text-4xl text-stone-900 sm:text-5xl">Account dashboard</h1>

        {isLoading ? (
          <p className="mt-6 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-600">
            Loading your account...
          </p>
        ) : null}

        {error ? (
          <p className="mt-6 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {error}
          </p>
        ) : null}

        {user && !isLoading ? (
          <section className="mt-6 rounded-2xl border border-stone-200 bg-stone-50 p-5 text-sm text-stone-700">
            <h2 className="text-lg font-semibold text-stone-900">Profile</h2>
            <div className="mt-3 grid gap-2">
              <p>
                <span className="font-semibold text-stone-900">Name:</span> {user.name}
              </p>
              <p>
                <span className="font-semibold text-stone-900">Email:</span> {user.email}
              </p>
            </div>
          </section>
        ) : null}

        {!isLoading && user ? (
          <section className="mt-6 rounded-2xl border border-stone-200 bg-stone-50 p-5 text-sm text-stone-700">
            <h2 className="text-lg font-semibold text-stone-900">Past orders</h2>

            {orders.length === 0 ? (
              <p className="mt-3 text-stone-600">
                No paid orders found for <span className="font-semibold">{user.email}</span> yet.
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                {orders.map((order) => (
                  <article
                    key={order.checkoutSessionId}
                    className="rounded-xl border border-stone-200 bg-white p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="font-semibold text-stone-900">{order.checkoutSessionId}</p>
                      <p className="text-stone-600">{new Date(order.confirmedAt).toLocaleString()}</p>
                    </div>
                    <p className="mt-2 text-stone-700">
                      <span className="font-semibold text-stone-900">Status:</span> {order.paymentStatus}
                    </p>
                    <p className="mt-1 text-stone-700">
                      <span className="font-semibold text-stone-900">Total:</span>{" "}
                      {formatCurrency(order.amountTotalMinor / 100)}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </section>
        ) : null}

        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/"
            className="rounded-full border border-stone-300 px-5 py-3 text-sm font-semibold text-stone-700 transition hover:border-stone-500 hover:text-stone-900"
          >
            Continue shopping
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold !text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoggingOut ? "Logging out..." : "Log out"}
          </button>
        </div>
      </div>
    </main>
  );
}
