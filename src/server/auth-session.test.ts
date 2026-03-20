// @vitest-environment node

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  createRefreshToken,
  createSessionToken,
  getSessionTokenFromCookieHeader,
  verifyRefreshToken,
  verifySessionToken,
} from "./auth-session";

describe("auth-session", () => {
  const previousAccessSecret = process.env.JWT_ACCESS_SECRET;
  const previousRefreshSecret = process.env.JWT_REFRESH_SECRET;

  beforeEach(() => {
    process.env.JWT_ACCESS_SECRET = "this_is_a_demo_secret_that_is_long_enough_12345";
    process.env.JWT_REFRESH_SECRET = "this_is_a_demo_refresh_secret_that_is_long_enough_12345";
  });

  afterEach(() => {
    if (previousAccessSecret === undefined) {
      delete process.env.JWT_ACCESS_SECRET;
      return;
    }

    process.env.JWT_ACCESS_SECRET = previousAccessSecret;

    if (previousRefreshSecret === undefined) {
      delete process.env.JWT_REFRESH_SECRET;
      return;
    }

    process.env.JWT_REFRESH_SECRET = previousRefreshSecret;
  });

  it("creates and verifies a valid session token", async () => {
    const token = await createSessionToken({
      id: "usr_123",
      email: "buyer@example.com",
      name: "Buyer",
    });

    const user = await verifySessionToken(token);

    expect(user).not.toBeNull();
    expect(user?.email).toBe("buyer@example.com");
  });

  it("rejects tampered tokens", async () => {
    const token = await createSessionToken({
      id: "usr_123",
      email: "buyer@example.com",
      name: "Buyer",
    });
    const tampered = `${token}tampered`;

    await expect(verifySessionToken(tampered)).resolves.toBeNull();
  });

  it("extracts session token from cookie header", async () => {
    const token = await createSessionToken({
      id: "usr_123",
      email: "buyer@example.com",
      name: "Buyer",
    });
    const cookieHeader = `foo=bar; ma_session=${encodeURIComponent(token)}; theme=dark`;

    expect(getSessionTokenFromCookieHeader(cookieHeader)).toBe(token);
  });

  it("creates and verifies a valid refresh token", async () => {
    const token = await createRefreshToken({
      userId: "usr_456",
      tokenId: "token-id-123",
    });

    const payload = await verifyRefreshToken(token);

    expect(payload).not.toBeNull();
    expect(payload?.userId).toBe("usr_456");
    expect(payload?.tokenId).toBe("token-id-123");
  });
});
