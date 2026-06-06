import { NextResponse } from "next/server";
import { getOrdersByUserId } from "@/server/order-store";
import { getSessionUserFromRequest } from "@/server/auth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const user = await getSessionUserFromRequest(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const orders = await getOrdersByUserId(user.id);

  return NextResponse.json({
    orders,
  });
}
