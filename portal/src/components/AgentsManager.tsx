"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { GHANA_REGIONS } from "@/lib/regions";

export type AgentRow = {
  id: string;
  name: string;
  phone: string;
  region: string | null;
  active: boolean;
  createdAt: string;
  submissionCount: number;
};

export function AgentsManager({ initialAgents }: { initialAgents: AgentRow[] }) {
  const router = useRouter();
  const [agents, setAgents] = useState(initialAgents);
  const [form, setForm] = useState({ name: "", phone: "", pin: "", region: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/agents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        phone: form.phone,
        pin: form.pin,
        region: form.region || undefined,
      }),
    });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({ error: "Could not add agent." }));
      setError(data.error ?? "Could not add agent.");
      return;
    }

    setForm({ name: "", phone: "", pin: "", region: "" });
    router.refresh();
    const data = await res.json();
    setAgents((prev) => [
      {
        id: data.agent.id,
        name: data.agent.name,
        phone: data.agent.phone,
        region: form.region || null,
        active: true,
        createdAt: new Date().toISOString(),
        submissionCount: 0,
      },
      ...prev,
    ]);
  }

  async function toggleActive(agent: AgentRow) {
    setTogglingId(agent.id);
    const res = await fetch(`/api/agents/${agent.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !agent.active }),
    });
    setTogglingId(null);
    if (res.ok) {
      setAgents((prev) =>
        prev.map((a) => (a.id === agent.id ? { ...a, active: !a.active } : a))
      );
    }
  }

  const inputClass =
    "rounded-lg border border-border bg-card px-3.5 py-2.5 text-base outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";

  return (
    <div className="flex flex-col gap-8">
      <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <h2 className="text-lg font-semibold">Add an agro-dealer / field agent</h2>
        <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="agentName" className="text-sm font-medium">Name</label>
            <input
              required
              id="agentName"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className={inputClass}
              placeholder="e.g. Ama Boateng"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="agentPhone" className="text-sm font-medium">Phone number (used to log in)</label>
            <input
              id="agentPhone"
              required
              type="tel"
              inputMode="numeric"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              className={inputClass}
              placeholder="0201234567"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="agentPin" className="text-sm font-medium">PIN</label>
            <input
              id="agentPin"
              required
              type="text"
              inputMode="numeric"
              minLength={4}
              value={form.pin}
              onChange={(e) => setForm((f) => ({ ...f, pin: e.target.value }))}
              className={inputClass}
              placeholder="4+ digits"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="agentRegion" className="text-sm font-medium">Region (optional)</label>
            <select
              id="agentRegion"
              value={form.region}
              onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))}
              className={inputClass}
            >
              <option value="">No default region</option>
              {GHANA_REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
            >
              {loading ? "Adding..." : "Add agent"}
            </button>
          </div>
        </form>
      </div>

      <div>
        <h2 className="text-lg font-semibold">Agents ({agents.length})</h2>
        {agents.length === 0 ? (
          <p className="mt-2 text-sm text-muted">No agents added yet.</p>
        ) : (
          <div className="mt-3 overflow-x-auto rounded-xl border border-border bg-card">
            <table className="min-w-full divide-y divide-border text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-muted">
                  <th className="px-4 py-2.5">Name</th>
                  <th className="px-4 py-2.5">Phone</th>
                  <th className="px-4 py-2.5">Region</th>
                  <th className="px-4 py-2.5">Entries</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {agents.map((agent) => (
                  <tr key={agent.id}>
                    <td className="px-4 py-2.5 font-medium">{agent.name}</td>
                    <td className="px-4 py-2.5">{agent.phone}</td>
                    <td className="px-4 py-2.5">{agent.region ?? "—"}</td>
                    <td className="px-4 py-2.5">{agent.submissionCount}</td>
                    <td className="px-4 py-2.5">
                      <span
                        className={
                          agent.active
                            ? "rounded-full bg-brand/10 px-2 py-0.5 text-xs font-medium text-brand-dark"
                            : "rounded-full bg-border px-2 py-0.5 text-xs font-medium text-muted"
                        }
                      >
                        {agent.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <button
                        onClick={() => toggleActive(agent)}
                        disabled={togglingId === agent.id}
                        className="text-sm font-medium text-muted hover:text-brand transition-colors disabled:opacity-50"
                      >
                        {agent.active ? "Deactivate" : "Reactivate"}
                      </button>
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
