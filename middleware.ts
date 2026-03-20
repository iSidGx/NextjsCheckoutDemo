import { NextRequest, NextResponse } from "next/server";
import {
  AUTH_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
  verifyRefreshToken,
  verifySessionToken,
} from "@/server/auth-session";

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const accessToken = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const refreshToken = request.cookies.get(REFRESH_COOKIE_NAME)?.value;
  const user = accessToken ? await verifySessionToken(accessToken) : null;
  const canRefresh = refreshToken ? await verifyRefreshToken(refreshToken) : null;
  const isAuthenticated = Boolean(user || canRefresh);

  if (pathname === "/account" && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/account"],
};
