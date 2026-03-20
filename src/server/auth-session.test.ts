import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  createSessionToken,
  getSessionTokenFromCookieHeader,
  verifySessionToken,
} from "./auth-session";

describe("auth-session", () => {
  const previousSecret = process.env.AUTH_SESSION_SECRET;

  beforeEach(() => {
    process.env.AUTH_SESSION_SECRET = "this_is_a_demo_secret_that_is_long_enough_12345";
  });

  afterEach(() => {
    if (previousSecret === undefined) {
      delete process.env.AUTH_SESSION_SECRET;
      return;
    }

    process.env.AUTH_SESSION_SECRET = previousSecret;
  });

  it("creates and verifies a valid session token", () => {
    const token = createSessionToken({
      id: "usr_123",
      email: "buyer@example.com",
      name: "Buyer",
    });

    const user = verifySessionToken(token);

    expect(user).not.toBeNull();
    expect(user?.email).toBe("buyer@example.com");
  });

  it("rejects tampered tokens", () => {
    const token = createSessionToken({
      id: "usr_123",
      email: "buyer@example.com",
      name: "Buyer",
    });
    const tampered = `${token}tampered`;

    expect(verifySessionToken(tampered)).toBeNull();
  });

  it("extracts session token from cookie header", () => {
    const token = createSessionToken({
      id: "usr_123",
      email: "buyer@example.com",
      name: "Buyer",
    });
    const cookieHeader = `foo=bar; ma_session=${encodeURIComponent(token)}; theme=dark`;

    expect(getSessionTokenFromCookieHeader(cookieHeader)).toBe(token);
  });
});
