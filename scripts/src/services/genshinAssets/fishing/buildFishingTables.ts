import type { GameDataBuild } from "#src/models/gameData/GameDataBuild";
import type { ExcelFishBaitRow } from "#src/models/genshinAssets/fishing/ExcelFishBaitRow";
import type { ExcelFishPoolRow } from "#src/models/genshinAssets/fishing/ExcelFishPoolRow";
import type { ExcelFishProficientRow } from "#src/models/genshinAssets/fishing/ExcelFishProficientRow";
import type { ExcelFishRewardRow } from "#src/models/genshinAssets/fishing/ExcelFishRewardRow";
import type { ExcelFishRodRow } from "#src/models/genshinAssets/fishing/ExcelFishRodRow";
import type { ExcelFishSkillRow } from "#src/models/genshinAssets/fishing/ExcelFishSkillRow";
import type { ExcelFishStockRow } from "#src/models/genshinAssets/fishing/ExcelFishStockRow";
import type { Fish, FishingPool, FishReward, FishRod } from "genshin-world";

import { CityIdRegionMap } from "#src/services/genshinAssets/fishing/constants";
import { toFishingPool } from "#src/services/genshinAssets/fishing/toFishingPool";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { GameDataset } from "genshin-world";

const toFish = (row: Fish): Fish => ({
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
  proficientId: row.proficientId,
  rewardId: row.rewardId,
  skillId: row.skillId,
});

const toFishRod = (row: ExcelFishRodRow): FishRod => ({
  attackAcc: row.attackAcc,
  attackMag: row.attackMag,
  baseAttack: row.baseAttack,
  cityId: row.cityId,
  id: row.id,
  maxAttack: row.maxAttack,
});

const toFishSkill = (row: ExcelFishSkillRow): ExcelFishSkillRow => ({
  bonusDuration: row.bonusDuration,
  bonusOffset: row.bonusOffset,
  bonusSpeed: row.bonusSpeed,
  bonusWidth: row.bonusWidth,
  duration: row.duration,
  forceFactor: row.forceFactor,
  id: row.id,
  param: row.param,
  priority: row.priority,
  skillCategory: row.skillCategory,
  skillType: row.skillType,
});

// A blank item entry in a reward row holds item zero, so it is left out of the reward
const toFishReward = (row: ExcelFishRewardRow): FishReward => ({
  rewardId: row.rewardId,
  rewardItemList: row.rewardItemList
    .filter((item) => item.itemId !== 0)
    .map(({ itemCount, itemId }) => ({ itemCount, itemId })),
});

// The fish, their rods, skills, baits, proficiency and each fish's catch reward, and each region's pools built as the
// Fishing dataset's records, the pools filed by the city they are fished in. A pool filed under no region named here is
// Left out and counted in the notes
export const buildFishingTables = (): GameDataBuild => {
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
  const fish = readExcelTable<Fish>("FishExcelConfigData").map((row) => toFish(row));
  const rods = readExcelTable<ExcelFishRodRow>("FishRodExcelConfigData").map((row) => toFishRod(row));
  const baits = readExcelTable<ExcelFishBaitRow>("FishBaitExcelConfigData").map((row) => row.id);
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
      `${baits.length} baits, ${skills.length} fish skills, ${proficiency.length} proficiency rows`,
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
