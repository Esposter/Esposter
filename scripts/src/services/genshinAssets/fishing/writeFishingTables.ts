import type { ExcelFishPoolRow } from "#src/models/genshinAssets/fishing/ExcelFishPoolRow";
import type { ExcelFishRodRow } from "#src/models/genshinAssets/fishing/ExcelFishRodRow";
import type { ExcelFishRow } from "#src/models/genshinAssets/fishing/ExcelFishRow";
import type { ExcelFishStockRow } from "#src/models/genshinAssets/fishing/ExcelFishStockRow";
import type { Fish, FishingPool, FishRod } from "genshin-world";

import {
  CityIdRegionMap,
  FISH_PATH,
  FISHING_POOLS_PATH,
  FISHING_RODS_PATH,
} from "#src/services/genshinAssets/fishing/constants";
import { toFishingPool } from "#src/services/genshinAssets/fishing/toFishingPool";
import { readExcelTable } from "#src/services/genshinAssets/stats/readExcelTable";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

const toFish = (row: ExcelFishRow): Fish => ({
  attractRange: row.attractRange,
  biteTimeout: row.biteTimeout,
  bonusDuration: row.bonusDuration,
  bonusOffset: row.bonusOffset,
  bonusSpeed: row.bonusSpeed,
  bonusWidth: row.bonusWidth,
  feelerTimes: row.feelerTimes,
  fleeRange: row.fleeRange,
  hp: row.hp,
  id: row.id,
  itemId: row.itemId,
});

const toFishRod = (row: ExcelFishRodRow): FishRod => ({
  attackAcc: row.attackAcc,
  attackMag: row.attackMag,
  baseAttack: row.baseAttack,
  cityId: row.cityId,
  id: row.id,
  maxAttack: row.maxAttack,
});

const writeJson = async (path: string, content: unknown): Promise<void> => {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(content)}\n`);
};

// The fish, their rods and each region's pools written as the world's generated slices, the pools filed by the city they
// Are fished in. A pool filed under no region named here is left out and counted in the report
export const writeFishingTables = async (): Promise<string> => {
  const stocks = new Map(
    readExcelTable<ExcelFishStockRow>("FishStockExcelConfigData").map((stock) => [stock.id, stock]),
  );
  const regionPools: Record<string, FishingPool[]> = {};
  let skippedPools = 0;
  for (const row of readExcelTable<ExcelFishPoolRow>("FishPoolExcelConfigData")) {
    const region = CityIdRegionMap[row.cityId];
    if (region === undefined) {
      skippedPools++;
      continue;
    }
    regionPools[region] = [...(regionPools[region] ?? []), toFishingPool(row, stocks)];
  }
  const fish = readExcelTable<ExcelFishRow>("FishExcelConfigData").map((row) => toFish(row));
  const rods = readExcelTable<ExcelFishRodRow>("FishRodExcelConfigData").map((row) => toFishRod(row));
  await Promise.all([
    writeJson(FISH_PATH, fish),
    writeJson(FISHING_POOLS_PATH, regionPools),
    writeJson(FISHING_RODS_PATH, rods),
  ]);
  return [
    ...Object.entries(regionPools).map(([region, pools]) => `${region}: ${pools.length} pools`),
    `${fish.length} fish and ${rods.length} rods, ${skippedPools} pools in no region left out`,
    FISH_PATH,
    FISHING_POOLS_PATH,
    FISHING_RODS_PATH,
  ].join("\n");
};
