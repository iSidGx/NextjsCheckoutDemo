"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";

type AuthMode = "login" | "register";

function isSafeInternalPath(path: string | null): path is string {
  if (!path) {
    return false;
  }

  if (!path.startsWith("/")) {
    return false;
  }

  if (path.startsWith("//")) {
    return false;
  }

  if (path.includes("://")) {
    return false;
  }

  return true;
}

export default function LoginPage() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const endpoint = useMemo(() => {
    return mode === "login" ? "/api/auth/login" : "/api/auth/register";
  }, [mode]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const payload =
        mode === "login"
          ? { email, password }
          : { name: name.trim(), email, password };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        setError(data.error ?? "Unable to authenticate.");
        return;
      }

      const nextPath = new URLSearchParams(window.location.search).get("next");
      const destination = isSafeInternalPath(nextPath) ? nextPath : "/account";

      window.location.assign(destination);
    } catch {
      setError("Unable to authenticate right now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="px-6 py-12 sm:px-8">
      <div className="mx-auto max-w-xl rounded-[2rem] border border-stone-200/70 bg-white/90 p-8 shadow-[0_30px_90px_-50px_rgba(28,25,23,0.55)] backdrop-blur">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-amber-700">Account access</p>
        <h1 className="mt-4 text-4xl text-stone-900 sm:text-5xl">
          {mode === "login" ? "Welcome back" : "Create your account"}
        </h1>

        <div className="mt-6 inline-flex rounded-full border border-stone-300 bg-stone-50 p-1 text-sm font-semibold">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`rounded-full px-4 py-2 transition ${
              mode === "login" ? "bg-white text-stone-900 shadow-sm" : "text-stone-600"
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setMode("register")}
            className={`rounded-full px-4 py-2 transition ${
              mode === "register" ? "bg-white text-stone-900 shadow-sm" : "text-stone-600"
            }`}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {mode === "register" ? (
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-stone-700">Name</span>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                minLength={2}
                className="w-full rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-stone-900 outline-none transition focus:border-stone-500"
              />
            </label>
          ) : null}

          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-stone-700">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="email"
              className="w-full rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-stone-900 outline-none transition focus:border-stone-500"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-stone-700">Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={mode === "register" ? 8 : 1}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              className="w-full rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-stone-900 outline-none transition focus:border-stone-500"
            />
          </label>

          {error ? (
            <p className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold !text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting
              ? "Working..."
              : mode === "login"
                ? "Log in"
                : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-sm text-stone-600">
          You can view past paid orders on your account page when your checkout email matches your account email.
        </p>

        <Link
          href="/"
          className="mt-6 inline-flex rounded-full border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-stone-500 hover:text-stone-900"
        >
          Back to products
        </Link>
      </div>
    </main>
  );
}
