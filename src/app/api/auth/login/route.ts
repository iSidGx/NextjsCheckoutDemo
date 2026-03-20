import { NextResponse } from "next/server";
import { z } from "zod";
import { createSessionToken, AUTH_COOKIE_NAME } from "@/server/auth-session";
import { verifyPassword } from "@/server/password";
import { getUserByEmail } from "@/server/user-store";

export const runtime = "nodejs";

const loginSchema = z.object({
  email: z.string().trim().email("Please provide a valid email address."),
  password: z.string().min(1, "Password is required."),
});

export async function POST(request: Request) {
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

  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: createSessionToken({ id: user.id, email: user.email, name: user.name }),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
