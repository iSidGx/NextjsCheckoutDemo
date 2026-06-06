import { randomUUID } from "node:crypto";
import { UserAccountRecord } from "@/domain/auth/types";
import { hashPassword } from "@/server/password";
import { getDb } from "@/server/db";

async function usersCollection() {
  const db = await getDb();
  return db.collection<UserAccountRecord>("users");
}

export async function getUserByEmail(email: string): Promise<UserAccountRecord | null> {
  const col = await usersCollection();
  const doc = await col.findOne(
    { email: email.trim().toLowerCase() },
    { projection: { _id: 0 } },
  );
  return doc as UserAccountRecord | null;
}

export async function getUserById(userId: string): Promise<UserAccountRecord | null> {
  const col = await usersCollection();
  const doc = await col.findOne({ id: userId }, { projection: { _id: 0 } });
  return doc as UserAccountRecord | null;
}

export async function createUserAccount(input: {
  email: string;
  name: string;
  password: string;
}): Promise<UserAccountRecord | null> {
  const col = await usersCollection();
  const normalizedEmail = input.email.trim().toLowerCase();

  const user: UserAccountRecord = {
    id: `usr_${randomUUID()}`,
    email: normalizedEmail,
    name: input.name.trim(),
    passwordHash: await hashPassword(input.password),
    createdAt: new Date().toISOString(),
  };

  try {
    await col.insertOne(user);
    return user;
  } catch (err) {
    // MongoDB duplicate key error — email already registered.
    if (typeof err === "object" && err !== null && "code" in err && err.code === 11000) {
      return null;
    }
    throw err;
  }
}
