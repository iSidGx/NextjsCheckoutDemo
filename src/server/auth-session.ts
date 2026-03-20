import { JWTPayload, jwtVerify, SignJWT } from "jose";
import { SessionUser } from "@/domain/auth/types";

export const AUTH_COOKIE_NAME = "ma_session";
export const REFRESH_COOKIE_NAME = "ma_refresh";
export const ACCESS_TOKEN_TTL_SECONDS = 60 * 15;
export const REFRESH_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7;
const JWT_ISSUER = "mug-atelier";
const ACCESS_JWT_AUDIENCE = "mug-atelier-auth";
const REFRESH_JWT_AUDIENCE = "mug-atelier-refresh";

interface SessionJwtPayload extends JWTPayload {
  sub: string;
  email: string;
  name: string;
}

function getJwtSecret() {
  const secret = process.env.JWT_ACCESS_SECRET ?? process.env.AUTH_SESSION_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error(
      "JWT_ACCESS_SECRET (or AUTH_SESSION_SECRET for backward compatibility) must be set and at least 32 characters long.",
    );
  }

  return new TextEncoder().encode(secret);
}

function getRefreshJwtSecret() {
  const secret = process.env.JWT_REFRESH_SECRET ?? process.env.JWT_ACCESS_SECRET ?? process.env.AUTH_SESSION_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error(
      "JWT_REFRESH_SECRET (or JWT_ACCESS_SECRET/AUTH_SESSION_SECRET fallback) must be set and at least 32 characters long.",
    );
  }

  return new TextEncoder().encode(secret);
}

export async function createSessionToken(user: SessionUser) {
  const now = Math.floor(Date.now() / 1000);

  return new SignJWT({
    email: user.email,
    name: user.name,
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt(now)
    .setIssuer(JWT_ISSUER)
    .setAudience(ACCESS_JWT_AUDIENCE)
    .setSubject(user.id)
    .setExpirationTime(now + ACCESS_TOKEN_TTL_SECONDS)
    .sign(getJwtSecret());
}

interface RefreshJwtPayload extends JWTPayload {
  sub: string;
  tokenId: string;
}

export async function createRefreshToken(params: { userId: string; tokenId: string }) {
  const now = Math.floor(Date.now() / 1000);

  return new SignJWT({
    tokenId: params.tokenId,
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt(now)
    .setIssuer(JWT_ISSUER)
    .setAudience(REFRESH_JWT_AUDIENCE)
    .setSubject(params.userId)
    .setExpirationTime(now + REFRESH_TOKEN_TTL_SECONDS)
    .sign(getRefreshJwtSecret());
}

export async function verifySessionToken(token: string) {
  let payload: SessionJwtPayload;
  try {
    const verified = await jwtVerify<SessionJwtPayload>(token, getJwtSecret(), {
      issuer: JWT_ISSUER,
      audience: ACCESS_JWT_AUDIENCE,
    });
    payload = verified.payload;
  } catch {
    return null;
  }

  if (!payload.sub || !payload.email || !payload.name) {
    return null;
  }

  return {
    id: payload.sub,
    email: payload.email,
    name: payload.name,
  } as SessionUser;
}

export async function verifyRefreshToken(token: string) {
  let payload: RefreshJwtPayload;

  try {
    const verified = await jwtVerify<RefreshJwtPayload>(token, getRefreshJwtSecret(), {
      issuer: JWT_ISSUER,
      audience: REFRESH_JWT_AUDIENCE,
    });
    payload = verified.payload;
  } catch {
    return null;
  }

  if (!payload.sub || !payload.tokenId) {
    return null;
  }

  return {
    userId: payload.sub,
    tokenId: payload.tokenId,
  };
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

export function getCookieValueFromHeader(cookieHeader: string | null, cookieName: string) {
  if (!cookieHeader) {
    return null;
  }

  const entries = cookieHeader.split(";");

  for (const entry of entries) {
    const [rawName, ...rawValue] = entry.trim().split("=");

    if (rawName === cookieName) {
      return decodeURIComponent(rawValue.join("="));
    }
  }

  return null;
}
