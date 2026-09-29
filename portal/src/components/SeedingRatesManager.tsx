"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export type RateRow = {
  id: string;
  crop: string;
  kgPerAcre: number;
  bagSizeKg: number;
};

function EditableRow({ rate }: { rate: RateRow }) {
  const router = useRouter();
  const [kgPerAcre, setKgPerAcre] = useState(String(rate.kgPerAcre));
  const [bagSizeKg, setBagSizeKg] = useState(String(rate.bagSizeKg));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    const res = await fetch("/api/settings/seeding-rates", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: rate.id, kgPerAcre, bagSizeKg }),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2000);
    }
  }

  const bagsPerAcre = Number(kgPerAcre) / Number(bagSizeKg);
  const inputClass =
    "w-28 rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";

  return (
    <tr>
      <td className="px-4 py-2.5 font-medium">{rate.crop}</td>
      <td className="px-4 py-2.5">
        <input
          type="number"
          step="0.1"
          min="0.1"
          value={kgPerAcre}
          onChange={(e) => setKgPerAcre(e.target.value)}
          className={inputClass}
        />
      </td>
      <td className="px-4 py-2.5">
        <input
          type="number"
          step="0.1"
          min="0.1"
          value={bagSizeKg}
          onChange={(e) => setBagSizeKg(e.target.value)}
          className={inputClass}
        />
      </td>
      <td className="px-4 py-2.5 text-muted">
        {Number.isFinite(bagsPerAcre) ? bagsPerAcre.toFixed(2) : "—"}
      </td>
      <td className="px-4 py-2.5 text-right">
        <button
          onClick={handleSave}
          disabled={saving}
          className="text-sm font-medium text-brand hover:text-brand-dark transition-colors disabled:opacity-50"
        >
          {saving ? "Saving..." : saved ? "Saved" : "Save"}
        </button>
      </td>
    </tr>
  );
}

export function SeedingRatesManager({ initialRates }: { initialRates: RateRow[] }) {
  const router = useRouter();
  const [rates, setRates] = useState(initialRates);
  const [form, setForm] = useState({ crop: "", kgPerAcre: "", bagSizeKg: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/settings/seeding-rates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({ error: "Could not add crop." }));
      setError(data.error ?? "Could not add crop.");
      return;
    }

    const data = await res.json();
    setRates((prev) => [...prev, data.rate].sort((a, b) => a.crop.localeCompare(b.crop)));
    setForm({ crop: "", kgPerAcre: "", bagSizeKg: "" });
    router.refresh();
  }

  const inputClass =
    "rounded-lg border border-border bg-card px-3.5 py-2.5 text-base outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";

  return (
    <div className="flex flex-col gap-8">
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="min-w-full divide-y divide-border text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-muted">
              <th className="px-4 py-2.5">Crop</th>
              <th className="px-4 py-2.5">kg seed / acre</th>
              <th className="px-4 py-2.5">Bag size (kg)</th>
              <th className="px-4 py-2.5">Bags / acre</th>
              <th className="px-4 py-2.5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rates.map((rate) => (
              <EditableRow key={rate.id} rate={rate} />
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <h2 className="text-lg font-semibold">Add a new crop</h2>
        <form onSubmit={handleAdd} className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="newCropName" className="text-sm font-medium">Crop name</label>
            <input
              id="newCropName"
              required
              value={form.crop}
              onChange={(e) => setForm((f) => ({ ...f, crop: e.target.value }))}
              className={inputClass}
              placeholder="e.g. Cowpea"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="newCropKgPerAcre" className="text-sm font-medium">kg seed / acre</label>
            <input
              id="newCropKgPerAcre"
              required
              type="number"
              step="0.1"
              min="0.1"
              value={form.kgPerAcre}
              onChange={(e) => setForm((f) => ({ ...f, kgPerAcre: e.target.value }))}
              className={inputClass}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="newCropBagSize" className="text-sm font-medium">Bag size (kg)</label>
            <input
              id="newCropBagSize"
              required
              type="number"
              step="0.1"
              min="0.1"
              value={form.bagSizeKg}
              onChange={(e) => setForm((f) => ({ ...f, bagSizeKg: e.target.value }))}
              className={inputClass}
            />
          </div>
          {error && <p className="text-sm text-red-600 sm:col-span-3">{error}</p>}
          <div className="sm:col-span-3">
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
            >
              {loading ? "Adding..." : "Add crop"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
