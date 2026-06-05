import { createHash, randomUUID } from "node:crypto";
import { RefreshTokenRecord } from "@/domain/auth/types";
import { getDb } from "@/server/db";

const REFRESH_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7;

async function refreshTokensCollection() {
  const db = await getDb();
  return db.collection<RefreshTokenRecord>("refresh_tokens");
}

export function hashRefreshTokenId(tokenId: string): string {
  return createHash("sha256").update(tokenId).digest("hex");
}

export async function issueRefreshTokenRecord(
  userId: string,
): Promise<{ tokenId: string; expiresInSeconds: number }> {
  const col = await refreshTokensCollection();
  const tokenId = randomUUID();
  const tokenIdHash = hashRefreshTokenId(tokenId);
  const createdAt = new Date();
  const expiresAt = new Date(createdAt.getTime() + REFRESH_TOKEN_TTL_SECONDS * 1000);

  await col.insertOne({
    id: `rt_${randomUUID()}`,
    userId,
    tokenIdHash,
    createdAt: createdAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
    revokedAt: null,
    replacedByTokenIdHash: null,
  });

  return { tokenId, expiresInSeconds: REFRESH_TOKEN_TTL_SECONDS };
}

export async function consumeRefreshTokenRecord(params: {
  userId: string;
  tokenId: string;
  replacedByTokenId?: string;
}): Promise<boolean> {
  const col = await refreshTokensCollection();
  const nowIso = new Date().toISOString();
  const tokenIdHash = hashRefreshTokenId(params.tokenId);
  const replacedByTokenIdHash = params.replacedByTokenId
    ? hashRefreshTokenId(params.replacedByTokenId)
    : null;

  // Atomically mark the token as revoked in a single round-trip.
  const result = await col.findOneAndUpdate(
    {
      userId: params.userId,
      tokenIdHash,
      revokedAt: null,
      expiresAt: { $gt: nowIso },
    },
    {
      $set: { revokedAt: nowIso, replacedByTokenIdHash },
    },
  );

  return result !== null;
}

export async function revokeRefreshTokensForUser(userId: string): Promise<void> {
  const col = await refreshTokensCollection();
  await col.updateMany(
    { userId, revokedAt: null },
    { $set: { revokedAt: new Date().toISOString() } },
  );
}
