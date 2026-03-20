import { NextRequest, NextResponse } from "next/server";

const AUTH_COOKIE_NAME = "ma_session";

interface TokenPayload {
  exp?: number;
  id?: string;
  email?: string;
  name?: string;
}

function base64UrlToBytes(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const decoded = atob(padded);
  const bytes = new Uint8Array(decoded.length);

  for (let index = 0; index < decoded.length; index += 1) {
    bytes[index] = decoded.charCodeAt(index);
  }

  return bytes;
}

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function verifySessionToken(token: string) {
  const [encodedPayload, providedSignature] = token.split(".");

  if (!encodedPayload || !providedSignature) {
    return false;
  }

  const sessionSecret = process.env.AUTH_SESSION_SECRET;

  if (!sessionSecret || sessionSecret.length < 32) {
    return false;
  }

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(sessionSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(encodedPayload),
  );
  const expectedSignature = bytesToBase64Url(new Uint8Array(signatureBuffer));

  if (expectedSignature !== providedSignature) {
    return false;
  }

  let payload: TokenPayload;

  try {
    const payloadJson = new TextDecoder().decode(base64UrlToBytes(encodedPayload));
    payload = JSON.parse(payloadJson) as TokenPayload;
  } catch {
    return false;
  }

  const now = Math.floor(Date.now() / 1000);

  if (!payload.exp || payload.exp <= now) {
    return false;
  }

  if (!payload.id || !payload.email || !payload.name) {
    return false;
  }

  return true;
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const isAuthenticated = token ? await verifySessionToken(token) : false;

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
