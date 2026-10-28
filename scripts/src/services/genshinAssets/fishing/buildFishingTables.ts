import type { GameDataBuild } from "#src/models/shared/GameDataBuild";
import type { ExcelFeatureTagGroupRow } from "#src/models/genshinAssets/fishing/ExcelFeatureTagGroupRow";
import type { ExcelFishBaitRow } from "#src/models/genshinAssets/fishing/ExcelFishBaitRow";
import type { ExcelFishPoolRow } from "#src/models/genshinAssets/fishing/ExcelFishPoolRow";
import type { ExcelFishProficientRow } from "#src/models/genshinAssets/fishing/ExcelFishProficientRow";
import type { ExcelFishRewardRow } from "#src/models/genshinAssets/fishing/ExcelFishRewardRow";
import type { ExcelFishRodRow } from "#src/models/genshinAssets/fishing/ExcelFishRodRow";
import type { ExcelFishRow } from "#src/models/genshinAssets/fishing/ExcelFishRow";
import type { ExcelFishSkillRow } from "#src/models/genshinAssets/fishing/ExcelFishSkillRow";
import type { ExcelFishStockRow } from "#src/models/genshinAssets/fishing/ExcelFishStockRow";
import type { FishingPool } from "genshin-world";

import { toFish } from "#src/services/genshinAssets/fishing/toFish";
import { toFishingBait } from "#src/services/genshinAssets/fishing/toFishingBait";
import { toFishingPool } from "#src/services/genshinAssets/fishing/toFishingPool";
import { toFishingPoolFishIds } from "#src/services/genshinAssets/fishing/toFishingPoolFishIds";
import { toFishReward } from "#src/services/genshinAssets/fishing/toFishReward";
import { toFishRod } from "#src/services/genshinAssets/fishing/toFishRod";
import { toFishSkill } from "#src/services/genshinAssets/fishing/toFishSkill";
import { CityIdRegionMap } from "#src/services/genshinAssets/shared/constants";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { GameDataset } from "genshin-world";

// The fish, their rods, skills, baits, proficiency and each fish's catch reward, and each region's pools built as the
// Fishing dataset's records, the pools filed by the city they are fished in. A pool filed under no region named here is
// Left out and counted in the notes. A bait's fish are joined from the dump, its pools' fish or its tags' fish
export const buildFishingTables = (): GameDataBuild => {
  const stocks = new Map(
    readExcelTable<ExcelFishStockRow>("FishStockExcelConfigData").map((stock) => [stock.id, stock]),
  );
  const poolRows = readExcelTable<ExcelFishPoolRow>("FishPoolExcelConfigData");
  const regionPools: Record<string, FishingPool[]> = {};
  let skippedPools = 0;
  for (const row of poolRows) {
    const region = CityIdRegionMap[row.cityId];
    if (region === undefined) {
      skippedPools++;
      continue;
    }
    regionPools[region] = [...(regionPools[region] ?? []), toFishingPool(row, stocks)];
  }
  const poolIdFishIdsMap = new Map(poolRows.map((row) => [row.id, toFishingPoolFishIds(row, stocks)]));
  const fishRows = readExcelTable<ExcelFishRow>("FishExcelConfigData");
  const fish = fishRows.map((row) => toFish(row));
  const groupIdTagsMap = new Map(
    readExcelTable<ExcelFeatureTagGroupRow>("FeatureTagGroupExcelConfigData").map((group) => [
      group.groupID,
      new Set(group.tagIDs.filter((tag) => tag !== 0)),
    ]),
  );
  const fishIdTagsMap = new Map(
    fishRows.map((row) => [row.id, groupIdTagsMap.get(row.monsterId) ?? new Set<number>()]),
  );
  const baits = readExcelTable<ExcelFishBaitRow>("FishBaitExcelConfigData").map((row) =>
    toFishingBait(row, fishIdTagsMap, poolIdFishIdsMap),
  );
  const joinedFishCount = new Set(baits.flatMap((bait) => bait.fishIds)).size;
  const rods = readExcelTable<ExcelFishRodRow>("FishRodExcelConfigData").map((row) => toFishRod(row));
  const skills = readExcelTable<ExcelFishSkillRow>("FishSkillExcelConfigData").map((row) => toFishSkill(row));
  const proficiency = readExcelTable<ExcelFishProficientRow>("FishProficientExcelConfigData");
  const fishRewardIds = new Set(fish.map((row) => row.rewardId));
  const rewards = readExcelTable<ExcelFishRewardRow>("RewardExcelConfigData")
    .filter((row) => fishRewardIds.has(row.rewardId))
    .map((row) => toFishReward(row));
  return {
    notes: [
      ...Object.entries(regionPools).map(([region, pools]) => `${region}: ${pools.length} pools`),
      `${fish.length} fish and ${rods.length} rods, ${skippedPools} pools in no region left out`,
      `${baits.length} baits drawing ${joinedFishCount} of ${fish.length} fish, ${skills.length} fish skills, ${proficiency.length} proficiency rows`,
      `${rewards.length} catch rewards, ${fishRewardIds.size} named by the fish`,
    ],
    objects: {
      [`${GameDataset.Fishing}/baits`]: baits,
      [`${GameDataset.Fishing}/fish`]: fish,
      [`${GameDataset.Fishing}/pools`]: regionPools,
      [`${GameDataset.Fishing}/proficiency`]: proficiency,
      [`${GameDataset.Fishing}/rewards`]: rewards,
      [`${GameDataset.Fishing}/rods`]: rods,
      [`${GameDataset.Fishing}/skills`]: skills,
    },
  };
};
