import path from "node:path";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  consumeRefreshTokenRecord,
  issueRefreshTokenRecord,
  revokeRefreshTokensForUser,
} from "./refresh-token-store";

describe("refresh-token-store", () => {
  let tempDirectory = "";

  beforeEach(async () => {
    tempDirectory = await mkdtemp(path.join(tmpdir(), "mug-refresh-"));
    process.env.REFRESH_TOKEN_STORE_FILE = path.join(tempDirectory, "refresh-tokens.json");
  });

  afterEach(async () => {
    delete process.env.REFRESH_TOKEN_STORE_FILE;

    if (tempDirectory) {
      await rm(tempDirectory, { recursive: true, force: true });
    }
  });

  it("issues and consumes a refresh token once", async () => {
    const issued = await issueRefreshTokenRecord("usr_1");

    const firstConsume = await consumeRefreshTokenRecord({
      userId: "usr_1",
      tokenId: issued.tokenId,
      replacedByTokenId: "replacement_123",
    });
    const secondConsume = await consumeRefreshTokenRecord({
      userId: "usr_1",
      tokenId: issued.tokenId,
      replacedByTokenId: "replacement_456",
    });

    expect(firstConsume).toBe(true);
    expect(secondConsume).toBe(false);
  });

  it("revokes all active refresh tokens for a user", async () => {
    const one = await issueRefreshTokenRecord("usr_2");
    const two = await issueRefreshTokenRecord("usr_2");
    await issueRefreshTokenRecord("usr_other");

    await revokeRefreshTokensForUser("usr_2");

    const consumeOne = await consumeRefreshTokenRecord({
      userId: "usr_2",
      tokenId: one.tokenId,
    });
    const consumeTwo = await consumeRefreshTokenRecord({
      userId: "usr_2",
      tokenId: two.tokenId,
    });

    expect(consumeOne).toBe(false);
    expect(consumeTwo).toBe(false);
  });
});
