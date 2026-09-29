import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { setSessionCookie, verifyPin } from "@/lib/auth";

const bodySchema = z.object({
  phone: z.string().min(3),
  pin: z.string().min(4),
});

export async function POST(request: NextRequest) {
  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a phone number and PIN." }, { status: 400 });
  }

  const { phone, pin } = parsed.data;
  const user = await db.user.findUnique({ where: { phone } });

  if (!user || !user.active || !(await verifyPin(pin, user.pinHash))) {
    return NextResponse.json({ error: "Incorrect phone number or PIN." }, { status: 401 });
  }

  await setSessionCookie({
    userId: user.id,
    name: user.name,
    phone: user.phone,
    role: user.role,
  });

  return NextResponse.json({ role: user.role });
}
