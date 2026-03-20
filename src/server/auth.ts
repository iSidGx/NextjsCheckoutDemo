import { verifySessionToken, getSessionTokenFromCookieHeader } from "@/server/auth-session";

export async function getSessionUserFromRequest(request: Request) {
  const sessionToken = getSessionTokenFromCookieHeader(request.headers.get("cookie"));

  if (!sessionToken) {
    return null;
  }

  return await verifySessionToken(sessionToken);
}
