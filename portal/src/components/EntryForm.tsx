"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import { GHANA_REGIONS } from "@/lib/regions";
import { MONTH_NAMES } from "@/lib/forecast";

type Props = {
  crops: string[];
  defaultRegion?: string | null;
};

function buildMonthOptions() {
  const now = new Date();
  const options: { value: string; label: string; month: number; year: number }[] = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const month = d.getMonth() + 1;
    const year = d.getFullYear();
    options.push({
      value: `${year}-${month}`,
      label: `${MONTH_NAMES[month - 1]} ${year}`,
      month,
      year,
    });
  }
  return options;
}

const emptyForm = {
  farmerName: "",
  farmerPhone: "",
  region: "",
  district: "",
  community: "",
  crop: "",
  variety: "",
  acres: "",
  plantingPeriod: "",
  notes: "",
};

export function EntryForm({ crops, defaultRegion }: Props) {
  const router = useRouter();
  const monthOptions = useMemo(() => buildMonthOptions(), []);
  const [form, setForm] = useState({ ...emptyForm, region: defaultRegion ?? "" });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const period = monthOptions.find((o) => o.value === form.plantingPeriod);
    if (!period) {
      setError("Select an expected planting month.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        farmerName: form.farmerName,
        farmerPhone: form.farmerPhone,
        region: form.region,
        district: form.district,
        community: form.community || undefined,
        crop: form.crop,
        variety: form.variety || undefined,
        acres: form.acres,
        plantingMonth: period.month,
        plantingYear: period.year,
        notes: form.notes || undefined,
      }),
    });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({ error: "Could not save this entry." }));
      setError(data.error ?? "Could not save this entry.");
      return;
    }

    setSuccess(`Saved — ${form.farmerName}'s ${form.crop} plan recorded.`);
    setForm({ ...emptyForm, region: defaultRegion ?? "" });
    router.refresh();
  }

  const inputClass =
    "rounded-lg border border-border bg-card px-3.5 py-2.5 text-base outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";
  const labelClass = "text-sm font-medium";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="farmerName" className={labelClass}>Farmer name</label>
          <input
            id="farmerName"
            required
            value={form.farmerName}
            onChange={(e) => update("farmerName", e.target.value)}
            placeholder="e.g. Kwabena Owusu"
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="farmerPhone" className={labelClass}>Farmer phone</label>
          <input
            id="farmerPhone"
            required
            type="tel"
            inputMode="numeric"
            value={form.farmerPhone}
            onChange={(e) => update("farmerPhone", e.target.value)}
            placeholder="0201234567"
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="region" className={labelClass}>Region</label>
          <select
            id="region"
            required
            value={form.region}
            onChange={(e) => update("region", e.target.value)}
            className={inputClass}
          >
            <option value="" disabled>
              Select region
            </option>
            {GHANA_REGIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="district" className={labelClass}>District</label>
          <input
            id="district"
            required
            value={form.district}
            onChange={(e) => update("district", e.target.value)}
            placeholder="e.g. Ejura-Sekyedumase"
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="community" className={labelClass}>Community (optional)</label>
        <input
          id="community"
          value={form.community}
          onChange={(e) => update("community", e.target.value)}
          placeholder="e.g. Anyinasu"
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="crop" className={labelClass}>Crop</label>
          <select
            id="crop"
            required
            value={form.crop}
            onChange={(e) => update("crop", e.target.value)}
            className={inputClass}
          >
            <option value="" disabled>
              Select crop
            </option>
            {crops.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="variety" className={labelClass}>Variety (optional)</label>
          <input
            id="variety"
            value={form.variety}
            onChange={(e) => update("variety", e.target.value)}
            placeholder="e.g. Obatanpa"
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="acres" className={labelClass}>Planned acreage</label>
          <input
            id="acres"
            required
            type="number"
            step="0.1"
            min="0.1"
            value={form.acres}
            onChange={(e) => update("acres", e.target.value)}
            placeholder="e.g. 2.5"
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="plantingPeriod" className={labelClass}>Expected planting month</label>
          <select
            id="plantingPeriod"
            required
            value={form.plantingPeriod}
            onChange={(e) => update("plantingPeriod", e.target.value)}
            className={inputClass}
          >
            <option value="" disabled>
              Select month
            </option>
            {monthOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="notes" className={labelClass}>Notes (optional)</label>
        <textarea
          id="notes"
          value={form.notes}
          onChange={(e) => update("notes", e.target.value)}
          rows={2}
          placeholder="Anything else worth flagging"
          className={inputClass}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-brand-dark">{success}</p>}

      <button
        type="submit"
        disabled={loading}
        className="mt-2 rounded-lg bg-brand px-4 py-2.5 text-base font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
      >
        {loading ? "Saving..." : "Save farmer entry"}
      </button>
    </form>
  );
}
