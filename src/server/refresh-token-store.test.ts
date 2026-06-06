// @vitest-environment node
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { getDb, resetDbCache } from "./db";
import {
  consumeRefreshTokenRecord,
  issueRefreshTokenRecord,
  revokeRefreshTokensForUser,
} from "./refresh-token-store";

describe("refresh-token-store", () => {
  let mongod: MongoMemoryServer;

  beforeAll(async () => {
    resetDbCache();
    mongod = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongod.getUri();
  });

  afterAll(async () => {
    delete process.env.MONGODB_URI;
    await mongod.stop();
  });

  beforeEach(async () => {
    const db = await getDb();
    await db.collection("refresh_tokens").deleteMany({});
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
