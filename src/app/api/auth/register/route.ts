import { NextResponse } from "next/server";
import { z } from "zod";
import { createSessionToken, AUTH_COOKIE_NAME } from "@/server/auth-session";
import { createUserAccount } from "@/server/user-store";

export const runtime = "nodejs";

const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters."),
  email: z.string().trim().email("Please provide a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = registerSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  }

  const user = await createUserAccount(parsed.data);

  if (!user) {
    return NextResponse.json({ error: "An account already exists for this email." }, { status: 409 });
  }

  const response = NextResponse.json(
    {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      },
    },
    { status: 201 },
  );

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
