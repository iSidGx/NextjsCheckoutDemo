import { NextResponse } from "next/server";
import { getSessionUserFromRequest } from "@/server/auth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const user = getSessionUserFromRequest(request);

  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  return NextResponse.json({ user });
}
