import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { GHANA_REGIONS } from "@/lib/regions";

const bodySchema = z.object({
  farmerName: z.string().trim().min(2, "Enter the farmer's name."),
  farmerPhone: z.string().trim().min(6, "Enter a valid phone number."),
  region: z.enum(GHANA_REGIONS),
  district: z.string().trim().min(2, "Enter the district."),
  community: z.string().trim().optional(),
  crop: z.string().trim().min(1, "Select a crop."),
  variety: z.string().trim().optional(),
  acres: z.coerce.number().positive("Acreage must be greater than 0."),
  plantingMonth: z.coerce.number().int().min(1).max(12),
  plantingYear: z.coerce.number().int().min(2020).max(2100),
  notes: z.string().trim().optional(),
});

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid submission." },
      { status: 400 }
    );
  }

  const validCrop = await db.seedingRate.findUnique({ where: { crop: parsed.data.crop } });
  if (!validCrop) {
    return NextResponse.json({ error: "Unknown crop." }, { status: 400 });
  }

  const submission = await db.farmerSubmission.create({
    data: {
      ...parsed.data,
      community: parsed.data.community || null,
      variety: parsed.data.variety || null,
      notes: parsed.data.notes || null,
      agentId: session.userId,
    },
  });

  return NextResponse.json({ submission }, { status: 201 });
}

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  }

  const limitParam = request.nextUrl.searchParams.get("limit");
  const limit = limitParam ? Math.min(Number(limitParam) || 20, 200) : 20;

  const submissions = await db.farmerSubmission.findMany({
    where: session.role === "ADMIN" ? {} : { agentId: session.userId },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: session.role === "ADMIN" ? { agent: { select: { name: true } } } : undefined,
  });

  return NextResponse.json({ submissions });
}
