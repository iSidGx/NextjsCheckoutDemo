import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./password";

describe("password", () => {
  it("hashes and verifies the correct password", async () => {
    const hash = await hashPassword("super-secret-pass");

    await expect(verifyPassword("super-secret-pass", hash)).resolves.toBe(true);
  });

  it("rejects incorrect passwords", async () => {
    const hash = await hashPassword("super-secret-pass");

    await expect(verifyPassword("wrong-pass", hash)).resolves.toBe(false);
  });
});
