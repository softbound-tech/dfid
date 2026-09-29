import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });

// Sample seeding rates only — confirm real kg/acre and bag sizes with your
// agronomy team before using this for a live pilot. These drive the
// acreage -> bags-of-seed conversion on the dashboard.
const SEEDING_RATES = [
  { crop: "Maize", kgPerAcre: 20, bagSizeKg: 10 },
  { crop: "Rice", kgPerAcre: 50, bagSizeKg: 20 },
  { crop: "Soybean", kgPerAcre: 25, bagSizeKg: 10 },
  { crop: "Vegetables", kgPerAcre: 0.5, bagSizeKg: 0.1 },
];

async function main() {
  for (const rate of SEEDING_RATES) {
    await db.seedingRate.upsert({
      where: { crop: rate.crop },
      update: {},
      create: rate,
    });
  }

  const adminPhone = "233200000001";
  const admin = await db.user.upsert({
    where: { phone: adminPhone },
    update: {},
    create: {
      name: "Qualiseed Admin",
      phone: adminPhone,
      pinHash: await bcrypt.hash("1234", 10),
      role: "ADMIN",
    },
  });

  const agentPhone = "233240000002";
  const agent = await db.user.upsert({
    where: { phone: agentPhone },
    update: {},
    create: {
      name: "Demo Agro-Dealer",
      phone: agentPhone,
      pinHash: await bcrypt.hash("1234", 10),
      role: "AGENT",
      region: "Ashanti",
    },
  });

  console.log("Seeded seeding rates for:", SEEDING_RATES.map((r) => r.crop).join(", "));
  console.log("Demo admin login  -> phone:", admin.phone, " PIN: 1234");
  console.log("Demo agent login  -> phone:", agent.phone, " PIN: 1234");
  console.log("\nChange these before any real pilot use.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
