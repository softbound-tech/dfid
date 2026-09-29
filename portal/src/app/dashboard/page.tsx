import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { StatTile } from "@/components/StatTile";
import { BarChartCard } from "@/components/BarChartCard";
import {
  MONTH_NAMES,
  groupByCrop,
  groupByCropRegionMonth,
  groupByRegion,
  toRateMap,
  upcomingActivity,
} from "@/lib/forecast";

function formatBags(n: number) {
  return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

function formatAcres(n: number) {
  return n.toLocaleString(undefined, { maximumFractionDigits: 1 });
}

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "ADMIN") redirect("/entry");

  const [submissions, rates, agentCount] = await Promise.all([
    db.farmerSubmission.findMany(),
    db.seedingRate.findMany(),
    db.user.count({ where: { role: "AGENT", active: true } }),
  ]);

  const rateMap = toRateMap(rates);
  const rows = groupByCropRegionMonth(submissions, rateMap);
  const byCrop = groupByCrop(rows);
  const byRegion = groupByRegion(rows);
  const upcoming = upcomingActivity(rows, new Date(), 3);

  const totalFarmers = submissions.length;
  const totalAcres = submissions.reduce((sum, s) => sum + s.acres, 0);
  const totalBags = byCrop.reduce((sum, c) => sum + c.estBags, 0);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Demand forecast</h1>
          <p className="mt-1 text-sm text-muted">
            Aggregated from every farmer planting plan your agro-dealers have recorded.
          </p>
        </div>
        <a
          href="/api/submissions/export"
          className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium hover:border-brand hover:text-brand transition-colors"
        >
          Export CSV
        </a>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatTile label="Farmers recorded" value={totalFarmers.toLocaleString()} />
        <StatTile label="Total acreage" value={formatAcres(totalAcres)} />
        <StatTile label="Est. seed bags needed" value={formatBags(totalBags)} />
        <StatTile label="Active agents" value={agentCount.toLocaleString()} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <BarChartCard
          title="Acreage by crop"
          valueLabel="Acres"
          data={byCrop.map((c) => ({ label: c.crop, value: Math.round(c.acres * 10) / 10 }))}
        />
        <BarChartCard
          title="Acreage by region"
          valueLabel="Acres"
          data={byRegion.map((r) => ({ label: r.region, value: Math.round(r.acres * 10) / 10 }))}
        />
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold">Upcoming planting — next 3 months</h2>
        <p className="mt-1 text-sm text-muted">
          Seed needs to be in agro-dealer hands before these planting windows open.
        </p>
        {upcoming.length === 0 ? (
          <p className="mt-3 text-sm text-muted">Nothing planned in the next 3 months yet.</p>
        ) : (
          <div className="mt-3 overflow-x-auto rounded-xl border border-border bg-card">
            <table className="min-w-full divide-y divide-border text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-muted">
                  <th className="px-4 py-2.5">Planting month</th>
                  <th className="px-4 py-2.5">Crop</th>
                  <th className="px-4 py-2.5">Region</th>
                  <th className="px-4 py-2.5">Farmers</th>
                  <th className="px-4 py-2.5">Acres</th>
                  <th className="px-4 py-2.5">Est. bags</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {upcoming.map((row) => (
                  <tr key={`${row.crop}-${row.region}-${row.plantingYear}-${row.plantingMonth}`}>
                    <td className="px-4 py-2.5 font-medium">
                      {MONTH_NAMES[row.plantingMonth - 1]} {row.plantingYear}
                    </td>
                    <td className="px-4 py-2.5">{row.crop}</td>
                    <td className="px-4 py-2.5">{row.region}</td>
                    <td className="px-4 py-2.5">{row.farmers}</td>
                    <td className="px-4 py-2.5">{formatAcres(row.acres)}</td>
                    <td className="px-4 py-2.5">{formatBags(row.estBags)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold">Full demand breakdown</h2>
        {rows.length === 0 ? (
          <p className="mt-3 text-sm text-muted">No farmer entries recorded yet.</p>
        ) : (
          <div className="mt-3 overflow-x-auto rounded-xl border border-border bg-card">
            <table className="min-w-full divide-y divide-border text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-muted">
                  <th className="px-4 py-2.5">Crop</th>
                  <th className="px-4 py-2.5">Region</th>
                  <th className="px-4 py-2.5">Planting</th>
                  <th className="px-4 py-2.5">Farmers</th>
                  <th className="px-4 py-2.5">Acres</th>
                  <th className="px-4 py-2.5">Est. bags</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((row) => (
                  <tr key={`${row.crop}-${row.region}-${row.plantingYear}-${row.plantingMonth}`}>
                    <td className="px-4 py-2.5 font-medium">{row.crop}</td>
                    <td className="px-4 py-2.5">{row.region}</td>
                    <td className="px-4 py-2.5">
                      {MONTH_NAMES[row.plantingMonth - 1]} {row.plantingYear}
                    </td>
                    <td className="px-4 py-2.5">{row.farmers}</td>
                    <td className="px-4 py-2.5">{formatAcres(row.acres)}</td>
                    <td className="px-4 py-2.5">{formatBags(row.estBags)}</td>
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
