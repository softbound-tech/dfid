import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { AgentsManager, type AgentRow } from "@/components/AgentsManager";

export default async function AgentsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "ADMIN") redirect("/entry");

  const agents = await db.user.findMany({
    where: { role: "AGENT" },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { submissions: true } } },
  });

  const rows: AgentRow[] = agents.map((a) => ({
    id: a.id,
    name: a.name,
    phone: a.phone,
    region: a.region,
    active: a.active,
    createdAt: a.createdAt.toISOString(),
    submissionCount: a._count.submissions,
  }));

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Agents</h1>
        <p className="mt-1 text-sm text-muted">
          Manage the agro-dealers and field agents who record farmer planting plans.
        </p>
      </div>
      <AgentsManager initialAgents={rows} />
    </div>
  );
}
