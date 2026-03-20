import { NextResponse } from "next/server";
import {
  ACCESS_TOKEN_TTL_SECONDS,
  AUTH_COOKIE_NAME,
  createRefreshToken,
  createSessionToken,
  getCookieValueFromHeader,
  REFRESH_COOKIE_NAME,
  REFRESH_TOKEN_TTL_SECONDS,
  verifyRefreshToken,
} from "@/server/auth-session";
import {
  consumeRefreshTokenRecord,
  issueRefreshTokenRecord,
  revokeRefreshTokensForUser,
} from "@/server/refresh-token-store";
import { consumeRateLimit, getRequestClientIp } from "@/server/rate-limit";
import { getUserById } from "@/server/user-store";

export const runtime = "nodejs";

function unauthorizedResponse() {
  const response = NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  response.cookies.set({
    name: REFRESH_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}

export async function POST(request: Request) {
  const ipAddress = getRequestClientIp(request);
  const ipLimit = consumeRateLimit(`auth:refresh:ip:${ipAddress}`, {
    windowMs: 60_000,
    maxRequests: 30,
  });

  if (!ipLimit.allowed) {
    return NextResponse.json(
      { error: "Too many refresh attempts. Please try again shortly." },
      {
        status: 429,
        headers: {
          "Retry-After": String(ipLimit.retryAfterSeconds),
        },
      },
    );
  }

  const refreshToken = getCookieValueFromHeader(request.headers.get("cookie"), REFRESH_COOKIE_NAME);

  if (!refreshToken) {
    return unauthorizedResponse();
  }

  const refreshPayload = await verifyRefreshToken(refreshToken);

  if (!refreshPayload) {
    return unauthorizedResponse();
  }

  const user = await getUserById(refreshPayload.userId);

  if (!user) {
    await revokeRefreshTokensForUser(refreshPayload.userId);
    return unauthorizedResponse();
  }

  const nextRefreshRecord = await issueRefreshTokenRecord(user.id);
  const consumed = await consumeRefreshTokenRecord({
    userId: user.id,
    tokenId: refreshPayload.tokenId,
    replacedByTokenId: nextRefreshRecord.tokenId,
  });

  if (!consumed) {
    await revokeRefreshTokensForUser(user.id);
    return unauthorizedResponse();
  }

  const response = NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    },
  });

  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: await createSessionToken({ id: user.id, email: user.email, name: user.name }),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ACCESS_TOKEN_TTL_SECONDS,
  });

  response.cookies.set({
    name: REFRESH_COOKIE_NAME,
    value: await createRefreshToken({
      userId: user.id,
      tokenId: nextRefreshRecord.tokenId,
    }),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: REFRESH_TOKEN_TTL_SECONDS,
  });

  return response;
}
