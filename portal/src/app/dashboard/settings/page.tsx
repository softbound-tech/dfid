import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { SeedingRatesManager } from "@/components/SeedingRatesManager";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "ADMIN") redirect("/entry");

  const rates = await db.seedingRate.findMany({ orderBy: { crop: "asc" } });

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Seeding rate settings</h1>
        <p className="mt-1 text-sm text-muted">
          These figures convert a farmer&apos;s planned acreage into estimated bags of seed on
          the dashboard. <strong>Sample defaults are loaded — confirm every figure with your
          agronomy team before relying on the forecast.</strong>
        </p>
      </div>
      <SeedingRatesManager initialRates={rates} />
    </div>
  );
}
