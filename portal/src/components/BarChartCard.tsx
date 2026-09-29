"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Row = { label: string; value: number };

function CustomTooltip({
  active,
  payload,
  valueLabel,
}: {
  active?: boolean;
  payload?: { payload: Row }[];
  valueLabel: string;
}) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-sm shadow-sm">
      <p className="font-medium">{row.label}</p>
      <p className="text-muted">
        {valueLabel}: <span className="font-medium text-foreground">{row.value.toLocaleString()}</span>
      </p>
    </div>
  );
}

export function BarChartCard({
  title,
  data,
  valueLabel,
}: {
  title: string;
  data: Row[];
  valueLabel: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold">{title}</h3>
      {data.length === 0 ? (
        <p className="mt-6 text-sm text-muted">No data yet.</p>
      ) : (
        <div className="mt-4 h-64 text-brand">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
              <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="0" />
              <XAxis
                dataKey="label"
                tick={{ fill: "var(--muted)", fontSize: 12 }}
                axisLine={{ stroke: "var(--border)" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "var(--muted)", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                width={40}
                allowDecimals={false}
              />
              <Tooltip
                cursor={{ fill: "var(--border)", opacity: 0.4 }}
                content={<CustomTooltip valueLabel={valueLabel} />}
              />
              <Bar dataKey="value" fill="currentColor" radius={[4, 4, 0, 0]} maxBarSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
