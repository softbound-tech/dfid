import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession, hashPin } from "@/lib/auth";
import { GHANA_REGIONS } from "@/lib/regions";

const bodySchema = z.object({
  name: z.string().trim().min(2, "Enter the agent's name."),
  phone: z.string().trim().min(6, "Enter a valid phone number."),
  pin: z.string().trim().min(4, "PIN must be at least 4 digits."),
  region: z.enum(GHANA_REGIONS).optional(),
});

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const agents = await db.user.findMany({
    where: { role: "AGENT" },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { submissions: true } } },
  });

  return NextResponse.json({ agents });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid agent details." },
      { status: 400 }
    );
  }

  const existing = await db.user.findUnique({ where: { phone: parsed.data.phone } });
  if (existing) {
    return NextResponse.json({ error: "A user with this phone number already exists." }, { status: 409 });
  }

  const agent = await db.user.create({
    data: {
      name: parsed.data.name,
      phone: parsed.data.phone,
      pinHash: await hashPin(parsed.data.pin),
      role: "AGENT",
      region: parsed.data.region ?? null,
    },
  });

  return NextResponse.json({ agent: { id: agent.id, name: agent.name, phone: agent.phone } }, { status: 201 });
}
