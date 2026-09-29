import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

const bodySchema = z.object({
  active: z.boolean(),
});

export async function PATCH(request: NextRequest, ctx: RouteContext<"/api/agents/[id]">) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const { id } = await ctx.params;
  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const existing = await db.user.findUnique({ where: { id } });
  if (!existing || existing.role !== "AGENT") {
    return NextResponse.json({ error: "Agent not found." }, { status: 404 });
  }

  const agent = await db.user.update({
    where: { id },
    data: { active: parsed.data.active },
  });

  return NextResponse.json({ agent: { id: agent.id, active: agent.active } });
}
