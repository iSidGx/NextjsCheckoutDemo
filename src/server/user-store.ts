import path from "node:path";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { UserAccountRecord } from "@/domain/auth/types";
import { hashPassword } from "@/server/password";

function getUserStoreFilePath() {
  return process.env.USER_STORE_FILE ?? path.join(process.cwd(), "data", "users.json");
}

async function readUsersFromDisk() {
  try {
    const storeFilePath = getUserStoreFilePath();
    const raw = await readFile(storeFilePath, "utf8");
    const parsed = JSON.parse(raw) as UserAccountRecord[];

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed;
  } catch (error) {
    const err = error as NodeJS.ErrnoException;

    if (err && typeof err === "object" && err.code === "ENOENT") {
      return [];
    }

    console.error("Failed to read users from disk:", err);
    throw err;
  }
}

async function writeUsersToDisk(users: UserAccountRecord[]) {
  const storeFilePath = getUserStoreFilePath();
  const directory = path.dirname(storeFilePath);

  await mkdir(directory, { recursive: true });

  const tempFilePath = `${storeFilePath}.tmp-${process.pid}-${Date.now()}`;
  const serialized = JSON.stringify(users, null, 2);

  await writeFile(tempFilePath, serialized, "utf8");
  await rename(tempFilePath, storeFilePath);
}

let userStoreQueue: Promise<unknown> = Promise.resolve();

function enqueueUserStoreOperation<T>(operation: () => Promise<T>): Promise<T> {
  const result = userStoreQueue.then(operation, operation);
  userStoreQueue = result.then(
    () => undefined,
    () => undefined,
  );
  return result;
}

export async function getUserByEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const users = await readUsersFromDisk();

  return users.find((user) => user.email.toLowerCase() === normalizedEmail) ?? null;
}

export async function createUserAccount(input: {
  email: string;
  name: string;
  password: string;
}) {
  const normalizedEmail = input.email.trim().toLowerCase();

  return enqueueUserStoreOperation(async () => {
    const users = await readUsersFromDisk();

    const exists = users.some((user) => user.email.toLowerCase() === normalizedEmail);

    if (exists) {
      return null;
    }

    const createdAt = new Date().toISOString();
    const user: UserAccountRecord = {
      id: `usr_${randomUUID()}`,
      email: normalizedEmail,
      name: input.name.trim(),
      passwordHash: await hashPassword(input.password),
      createdAt,
    };

    users.unshift(user);
    await writeUsersToDisk(users);

    return user;
  });
}
