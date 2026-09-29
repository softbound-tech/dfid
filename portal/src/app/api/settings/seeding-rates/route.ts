import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

const createSchema = z.object({
  crop: z.string().trim().min(2, "Enter a crop name."),
  kgPerAcre: z.coerce.number().positive("Must be greater than 0."),
  bagSizeKg: z.coerce.number().positive("Must be greater than 0."),
});

const updateSchema = z.object({
  id: z.string().min(1),
  kgPerAcre: z.coerce.number().positive("Must be greater than 0."),
  bagSizeKg: z.coerce.number().positive("Must be greater than 0."),
});

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return null;
  return session;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Not authorized." }, { status: 403 });

  const rates = await db.seedingRate.findMany({ orderBy: { crop: "asc" } });
  return NextResponse.json({ rates });
}

export async function POST(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Not authorized." }, { status: 403 });

  const json = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid." }, { status: 400 });
  }

  const existing = await db.seedingRate.findUnique({ where: { crop: parsed.data.crop } });
  if (existing) {
    return NextResponse.json({ error: "This crop already exists." }, { status: 409 });
  }

  const rate = await db.seedingRate.create({ data: parsed.data });
  return NextResponse.json({ rate }, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Not authorized." }, { status: 403 });

  const json = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid." }, { status: 400 });
  }

  const rate = await db.seedingRate.update({
    where: { id: parsed.data.id },
    data: { kgPerAcre: parsed.data.kgPerAcre, bagSizeKg: parsed.data.bagSizeKg },
  });

  return NextResponse.json({ rate });
}
