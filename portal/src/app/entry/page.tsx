import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { EntryForm } from "@/components/EntryForm";
import { MONTH_NAMES } from "@/lib/forecast";

export default async function EntryPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [rates, recent] = await Promise.all([
    db.seedingRate.findMany({ orderBy: { crop: "asc" } }),
    db.farmerSubmission.findMany({
      where: session.role === "ADMIN" ? {} : { agentId: session.userId },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Record a farmer&apos;s planting plan</h1>
        <p className="mt-1 text-sm text-muted">
          Capture what a farmer intends to plant so Qualiseed can forecast seed demand and plan
          distribution ahead of the season.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <EntryForm crops={rates.map((r) => r.crop)} defaultRegion={session.role === "AGENT" ? undefined : null} />
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-semibold">Your recent entries</h2>
        {recent.length === 0 ? (
          <p className="mt-2 text-sm text-muted">No entries recorded yet — your first submission will appear here.</p>
        ) : (
          <div className="mt-3 overflow-x-auto rounded-xl border border-border bg-card">
            <table className="min-w-full divide-y divide-border text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-muted">
                  <th className="px-4 py-2.5">Farmer</th>
                  <th className="px-4 py-2.5">Crop</th>
                  <th className="px-4 py-2.5">Acres</th>
                  <th className="px-4 py-2.5">Location</th>
                  <th className="px-4 py-2.5">Planting</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recent.map((s) => (
                  <tr key={s.id}>
                    <td className="px-4 py-2.5 font-medium">{s.farmerName}</td>
                    <td className="px-4 py-2.5">{s.crop}</td>
                    <td className="px-4 py-2.5">{s.acres}</td>
                    <td className="px-4 py-2.5">
                      {s.district}, {s.region}
                    </td>
                    <td className="px-4 py-2.5">
                      {MONTH_NAMES[s.plantingMonth - 1]} {s.plantingYear}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
