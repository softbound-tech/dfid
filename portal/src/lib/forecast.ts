import type { FarmerSubmission, SeedingRate } from "@prisma/client";

export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export type RateMap = Map<string, SeedingRate>;

export function toRateMap(rates: SeedingRate[]): RateMap {
  return new Map(rates.map((r) => [r.crop, r]));
}

export function estimateBags(crop: string, acres: number, rates: RateMap): number {
  const rate = rates.get(crop);
  if (!rate || rate.bagSizeKg <= 0) return 0;
  return (acres * rate.kgPerAcre) / rate.bagSizeKg;
}

export type GroupRow = {
  crop: string;
  region: string;
  plantingMonth: number;
  plantingYear: number;
  farmers: number;
  acres: number;
  estBags: number;
};

export function groupByCropRegionMonth(
  submissions: FarmerSubmission[],
  rates: RateMap
): GroupRow[] {
  const map = new Map<string, Omit<GroupRow, "estBags">>();

  for (const s of submissions) {
    const key = `${s.crop}|${s.region}|${s.plantingYear}-${s.plantingMonth}`;
    const existing = map.get(key);
    if (existing) {
      existing.farmers += 1;
      existing.acres += s.acres;
    } else {
      map.set(key, {
        crop: s.crop,
        region: s.region,
        plantingMonth: s.plantingMonth,
        plantingYear: s.plantingYear,
        farmers: 1,
        acres: s.acres,
      });
    }
  }

  return Array.from(map.values())
    .map((row) => ({ ...row, estBags: estimateBags(row.crop, row.acres, rates) }))
    .sort((a, b) => {
      if (a.plantingYear !== b.plantingYear) return a.plantingYear - b.plantingYear;
      if (a.plantingMonth !== b.plantingMonth) return a.plantingMonth - b.plantingMonth;
      return a.crop.localeCompare(b.crop);
    });
}

export type CropTotal = { crop: string; acres: number; estBags: number; farmers: number };

export function groupByCrop(rows: GroupRow[]): CropTotal[] {
  const map = new Map<string, CropTotal>();
  for (const row of rows) {
    const existing = map.get(row.crop);
    if (existing) {
      existing.acres += row.acres;
      existing.estBags += row.estBags;
      existing.farmers += row.farmers;
    } else {
      map.set(row.crop, { crop: row.crop, acres: row.acres, estBags: row.estBags, farmers: row.farmers });
    }
  }
  return Array.from(map.values()).sort((a, b) => b.acres - a.acres);
}

export type RegionTotal = { region: string; acres: number; estBags: number; farmers: number };

export function groupByRegion(rows: GroupRow[]): RegionTotal[] {
  const map = new Map<string, RegionTotal>();
  for (const row of rows) {
    const existing = map.get(row.region);
    if (existing) {
      existing.acres += row.acres;
      existing.estBags += row.estBags;
      existing.farmers += row.farmers;
    } else {
      map.set(row.region, { region: row.region, acres: row.acres, estBags: row.estBags, farmers: row.farmers });
    }
  }
  return Array.from(map.values()).sort((a, b) => b.acres - a.acres);
}

/** Rows whose planting month/year falls within the next `monthsAhead` months of `now` — the near-term distribution/activity list. */
export function upcomingActivity(rows: GroupRow[], now: Date, monthsAhead = 3): GroupRow[] {
  const nowIndex = now.getFullYear() * 12 + now.getMonth();
  return rows
    .filter((row) => {
      const rowIndex = row.plantingYear * 12 + (row.plantingMonth - 1);
      return rowIndex >= nowIndex && rowIndex <= nowIndex + monthsAhead;
    })
    .sort((a, b) => {
      const aIndex = a.plantingYear * 12 + (a.plantingMonth - 1);
      const bIndex = b.plantingYear * 12 + (b.plantingMonth - 1);
      return aIndex - bIndex;
    });
}
