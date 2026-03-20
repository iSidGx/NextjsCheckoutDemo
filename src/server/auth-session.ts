import { createHmac, timingSafeEqual } from "node:crypto";
import { SessionTokenPayload, SessionUser } from "@/domain/auth/types";

export const AUTH_COOKIE_NAME = "ma_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

function toBase64Url(value: Buffer | string) {
  return Buffer.from(value).toString("base64url");
}

function fromBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function getSessionSecret() {
  const secret = process.env.AUTH_SESSION_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SESSION_SECRET must be set and at least 32 characters long.");
  }

  return secret;
}

function signPayload(encodedPayload: string) {
  return toBase64Url(createHmac("sha256", getSessionSecret()).update(encodedPayload).digest());
}

export function createSessionToken(user: SessionUser) {
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionTokenPayload = {
    ...user,
    iat: now,
    exp: now + SESSION_TTL_SECONDS,
  };
  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const signature = signPayload(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

export function verifySessionToken(token: string) {
  const [encodedPayload, providedSignature] = token.split(".");

  if (!encodedPayload || !providedSignature) {
    return null;
  }

  const expectedSignature = signPayload(encodedPayload);
  const providedBuffer = Buffer.from(providedSignature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (providedBuffer.length !== expectedBuffer.length) {
    return null;
  }

  if (!timingSafeEqual(providedBuffer, expectedBuffer)) {
    return null;
  }

  let payload: SessionTokenPayload;

  try {
    payload = JSON.parse(fromBase64Url(encodedPayload)) as SessionTokenPayload;
  } catch {
    return null;
  }

  const now = Math.floor(Date.now() / 1000);

  if (!payload.exp || payload.exp <= now) {
    return null;
  }

  if (!payload.id || !payload.email || !payload.name) {
    return null;
  }

  return {
    id: payload.id,
    email: payload.email,
    name: payload.name,
  } as SessionUser;
}

export function getSessionTokenFromCookieHeader(cookieHeader: string | null) {
  if (!cookieHeader) {
    return null;
  }

  const entries = cookieHeader.split(";");

  for (const entry of entries) {
    const [rawName, ...rawValue] = entry.trim().split("=");

    if (rawName === AUTH_COOKIE_NAME) {
      return decodeURIComponent(rawValue.join("="));
    }
  }

  return null;
}
