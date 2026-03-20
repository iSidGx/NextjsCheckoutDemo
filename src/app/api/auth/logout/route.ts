import { NextResponse } from "next/server";
import {
  AUTH_COOKIE_NAME,
  getCookieValueFromHeader,
  REFRESH_COOKIE_NAME,
  verifyRefreshToken,
} from "@/server/auth-session";
import { revokeRefreshTokensForUser } from "@/server/refresh-token-store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const refreshToken = getCookieValueFromHeader(request.headers.get("cookie"), REFRESH_COOKIE_NAME);

  if (refreshToken) {
    const payload = await verifyRefreshToken(refreshToken);

    if (payload) {
      await revokeRefreshTokensForUser(payload.userId);
    }
  }

  const response = NextResponse.json({ success: true });

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
