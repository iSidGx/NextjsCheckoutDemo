import { NextResponse } from "next/server";
import { z } from "zod";
import {
  ACCESS_TOKEN_TTL_SECONDS,
  AUTH_COOKIE_NAME,
  createRefreshToken,
  createSessionToken,
  REFRESH_COOKIE_NAME,
  REFRESH_TOKEN_TTL_SECONDS,
} from "@/server/auth-session";
import { verifyPassword } from "@/server/password";
import { consumeRateLimit, getRequestClientIp } from "@/server/rate-limit";
import { issueRefreshTokenRecord } from "@/server/refresh-token-store";
import { getUserByEmail } from "@/server/user-store";

export const runtime = "nodejs";

const loginSchema = z.object({
  email: z.string().trim().email("Please provide a valid email address."),
  password: z.string().min(1, "Password is required."),
});

function tooManyRequestsResponse(retryAfterSeconds: number) {
  return NextResponse.json(
    { error: "Too many authentication attempts. Please try again shortly." },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfterSeconds),
      },
    },
  );
}

export async function POST(request: Request) {
  const ipAddress = getRequestClientIp(request);
  const ipLimit = consumeRateLimit(`auth:login:ip:${ipAddress}`, {
    windowMs: 60_000,
    maxRequests: 20,
  });

  if (!ipLimit.allowed) {
    return tooManyRequestsResponse(ipLimit.retryAfterSeconds);
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  }

  const accountLimit = consumeRateLimit(`auth:login:account:${parsed.data.email.toLowerCase()}`, {
    windowMs: 60_000,
    maxRequests: 8,
  });

  if (!accountLimit.allowed) {
    return tooManyRequestsResponse(accountLimit.retryAfterSeconds);
  }

  const user = await getUserByEmail(parsed.data.email);

  if (!user) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const isValidPassword = await verifyPassword(parsed.data.password, user.passwordHash);

  if (!isValidPassword) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const response = NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    },
  });

  const refreshTokenRecord = await issueRefreshTokenRecord(user.id);

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
      tokenId: refreshTokenRecord.tokenId,
    }),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: REFRESH_TOKEN_TTL_SECONDS,
  });

  return response;
}
