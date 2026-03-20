import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchWithAuthRetry } from "./auth-client";

describe("fetchWithAuthRetry", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns first response when request is already authorized", async () => {
    const okResponse = new Response(JSON.stringify({ ok: true }), { status: 200 });
    const fetchMock = vi.fn().mockResolvedValue(okResponse);
    vi.stubGlobal("fetch", fetchMock);

    const response = await fetchWithAuthRetry("/api/auth/me");

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith("/api/auth/me", {
      cache: "no-store",
    });
  });

  it("refreshes once and retries original request after 401", async () => {
    const unauthorized = new Response(null, { status: 401 });
    const refreshOk = new Response(null, { status: 200 });
    const retriedOk = new Response(JSON.stringify({ user: { id: "usr_1" } }), { status: 200 });

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(unauthorized)
      .mockResolvedValueOnce(refreshOk)
      .mockResolvedValueOnce(retriedOk);
    vi.stubGlobal("fetch", fetchMock);

    const response = await fetchWithAuthRetry("/api/auth/me");

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock).toHaveBeenNthCalledWith(1, "/api/auth/me", {
      cache: "no-store",
    });
    expect(fetchMock).toHaveBeenNthCalledWith(2, "/api/auth/refresh", {
      method: "POST",
      cache: "no-store",
    });
    expect(fetchMock).toHaveBeenNthCalledWith(3, "/api/auth/me", {
      cache: "no-store",
    });
  });

  it("returns the original 401 when refresh fails", async () => {
    const unauthorized = new Response(null, { status: 401 });
    const refreshUnauthorized = new Response(null, { status: 401 });

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(unauthorized)
      .mockResolvedValueOnce(refreshUnauthorized);
    vi.stubGlobal("fetch", fetchMock);

    const response = await fetchWithAuthRetry("/api/orders/mine");

    expect(response.status).toBe(401);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenNthCalledWith(1, "/api/orders/mine", {
      cache: "no-store",
    });
    expect(fetchMock).toHaveBeenNthCalledWith(2, "/api/auth/refresh", {
      method: "POST",
      cache: "no-store",
    });
  });
});
