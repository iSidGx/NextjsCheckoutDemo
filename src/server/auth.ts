import { verifySessionToken, getSessionTokenFromCookieHeader } from "@/server/auth-session";

export function getSessionUserFromRequest(request: Request) {
  const sessionToken = getSessionTokenFromCookieHeader(request.headers.get("cookie"));

  if (!sessionToken) {
    return null;
  }

  return verifySessionToken(sessionToken);
}
