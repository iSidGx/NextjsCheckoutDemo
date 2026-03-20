import path from "node:path";
import { createHash, randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { RefreshTokenRecord } from "@/domain/auth/types";

const REFRESH_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7;

function getRefreshTokenStoreFilePath() {
  return (
    process.env.REFRESH_TOKEN_STORE_FILE ?? path.join(process.cwd(), "data", "refresh-tokens.json")
  );
}

async function readRefreshTokensFromDisk() {
  try {
    const storeFilePath = getRefreshTokenStoreFilePath();
    const raw = await readFile(storeFilePath, "utf8");
    const parsed = JSON.parse(raw) as RefreshTokenRecord[];

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed;
  } catch (error) {
    const err = error as NodeJS.ErrnoException;

    if (err && typeof err === "object" && err.code === "ENOENT") {
      return [];
    }

    console.error("Failed to read refresh tokens from disk:", err);
    throw err;
  }
}

async function writeRefreshTokensToDisk(tokens: RefreshTokenRecord[]) {
  const storeFilePath = getRefreshTokenStoreFilePath();
  const directory = path.dirname(storeFilePath);

  await mkdir(directory, { recursive: true });

  const tempFilePath = `${storeFilePath}.tmp-${process.pid}-${Date.now()}`;
  const serialized = JSON.stringify(tokens, null, 2);

  await writeFile(tempFilePath, serialized, "utf8");
  await rename(tempFilePath, storeFilePath);
}

let refreshTokenQueue: Promise<unknown> = Promise.resolve();

function enqueueRefreshTokenOperation<T>(operation: () => Promise<T>): Promise<T> {
  const result = refreshTokenQueue.then(operation, operation);
  refreshTokenQueue = result.then(
    () => undefined,
    () => undefined,
  );

  return result;
}

export function hashRefreshTokenId(tokenId: string) {
  return createHash("sha256").update(tokenId).digest("hex");
}

export async function issueRefreshTokenRecord(userId: string) {
  const tokenId = randomUUID();
  const tokenIdHash = hashRefreshTokenId(tokenId);
  const createdAt = new Date();
  const expiresAt = new Date(createdAt.getTime() + REFRESH_TOKEN_TTL_SECONDS * 1000);

  await enqueueRefreshTokenOperation(async () => {
    const existingTokens = await readRefreshTokensFromDisk();

    existingTokens.unshift({
      id: `rt_${randomUUID()}`,
      userId,
      tokenIdHash,
      createdAt: createdAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
      revokedAt: null,
      replacedByTokenIdHash: null,
    });

    await writeRefreshTokensToDisk(existingTokens);
  });

  return {
    tokenId,
    expiresInSeconds: REFRESH_TOKEN_TTL_SECONDS,
  };
}

export async function consumeRefreshTokenRecord(params: {
  userId: string;
  tokenId: string;
  replacedByTokenId?: string;
}) {
  return enqueueRefreshTokenOperation(async () => {
    const existingTokens = await readRefreshTokensFromDisk();
    const nowIso = new Date().toISOString();
    const tokenIdHash = hashRefreshTokenId(params.tokenId);
    const replacedByTokenIdHash = params.replacedByTokenId
      ? hashRefreshTokenId(params.replacedByTokenId)
      : null;

    const target = existingTokens.find(
      (entry) =>
        entry.userId === params.userId &&
        entry.tokenIdHash === tokenIdHash &&
        !entry.revokedAt &&
        entry.expiresAt > nowIso,
    );

    if (!target) {
      return false;
    }

    target.revokedAt = nowIso;
    target.replacedByTokenIdHash = replacedByTokenIdHash;

    await writeRefreshTokensToDisk(existingTokens);

    return true;
  });
}

export async function revokeRefreshTokensForUser(userId: string) {
  await enqueueRefreshTokenOperation(async () => {
    const existingTokens = await readRefreshTokensFromDisk();
    const nowIso = new Date().toISOString();
    let didMutate = false;

    for (const token of existingTokens) {
      if (token.userId === userId && !token.revokedAt) {
        token.revokedAt = nowIso;
        didMutate = true;
      }
    }

    if (didMutate) {
      await writeRefreshTokensToDisk(existingTokens);
    }
  });
}
