import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

function csvEscape(value: string | number | null | undefined) {
  const str = value === null || value === undefined ? "" : String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const submissions = await db.farmerSubmission.findMany({
    orderBy: { createdAt: "desc" },
    include: { agent: { select: { name: true, phone: true } } },
  });

  const headers = [
    "Date recorded",
    "Agent",
    "Agent phone",
    "Farmer name",
    "Farmer phone",
    "Region",
    "District",
    "Community",
    "Crop",
    "Variety",
    "Acres",
    "Planting month",
    "Planting year",
    "Notes",
  ];

  const rows = submissions.map((s) =>
    [
      s.createdAt.toISOString(),
      s.agent.name,
      s.agent.phone,
      s.farmerName,
      s.farmerPhone,
      s.region,
      s.district,
      s.community ?? "",
      s.crop,
      s.variety ?? "",
      s.acres,
      s.plantingMonth,
      s.plantingYear,
      s.notes ?? "",
    ]
      .map(csvEscape)
      .join(",")
  );

  const csv = [headers.join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="qualiseed-submissions-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
