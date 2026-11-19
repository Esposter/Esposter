import type { ExcelFeatureTagGroupRow } from "#src/models/genshinAssets/fishing/ExcelFeatureTagGroupRow";
import type { ExcelFishBaitRow } from "#src/models/genshinAssets/fishing/ExcelFishBaitRow";
import type { ExcelFishPoolRow } from "#src/models/genshinAssets/fishing/ExcelFishPoolRow";
import type { ExcelFishProficientRow } from "#src/models/genshinAssets/fishing/ExcelFishProficientRow";
import type { ExcelFishRewardRow } from "#src/models/genshinAssets/fishing/ExcelFishRewardRow";
import type { ExcelFishRodRow } from "#src/models/genshinAssets/fishing/ExcelFishRodRow";
import type { ExcelFishSkillRow } from "#src/models/genshinAssets/fishing/ExcelFishSkillRow";
import type { ExcelFishStockRow } from "#src/models/genshinAssets/fishing/ExcelFishStockRow";
import type { ExcelMonsterRow } from "#src/models/genshinAssets/fishing/ExcelMonsterRow";
import type { GameDataBuild } from "#src/models/shared/GameDataBuild";
import type { Fish } from "genshin-world";

import { toFish } from "#src/services/genshinAssets/fishing/toFish";
import { toFishCategory } from "#src/services/genshinAssets/fishing/toFishCategory";
import { toFishingBait } from "#src/services/genshinAssets/fishing/toFishingBait";
import { toFishingPoolFishIds } from "#src/services/genshinAssets/fishing/toFishingPoolFishIds";
import { toFishingPoolsByRegion } from "#src/services/genshinAssets/fishing/toFishingPoolsByRegion";
import { toFishReward } from "#src/services/genshinAssets/fishing/toFishReward";
import { toFishRod } from "#src/services/genshinAssets/fishing/toFishRod";
import { toFishSkill } from "#src/services/genshinAssets/fishing/toFishSkill";
import { toFishTagMap } from "#src/services/genshinAssets/fishing/toFishTagMap";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { GameDataset } from "genshin-world";

// The fish, their rods, skills, baits, proficiency and each fish's catch reward, and each region's pools built as the
// Fishing dataset's records, the pools filed by the region their city lies in. A pool whose city no region holds is
// Left out and counted in the notes. A bait's fish are joined from the dump, its pools' fish or its tags' fish
export const buildFishingTables = (cityRegionMap: ReadonlyMap<number, string>): GameDataBuild => {
  const stocks = new Map(
    readExcelTable<ExcelFishStockRow>("FishStockExcelConfigData").map((stock) => [stock.id, stock]),
  );
  const poolRows = readExcelTable<ExcelFishPoolRow>("FishPoolExcelConfigData");
  const { regionPools, skippedPools } = toFishingPoolsByRegion(poolRows, stocks, cityRegionMap);
  const poolIdFishIdsMap = new Map(poolRows.map((row) => [row.id, toFishingPoolFishIds(row, stocks)]));
  const fishRows = readExcelTable<Fish>("FishExcelConfigData");
  const fishTagsMap = toFishTagMap(
    fishRows,
    readExcelTable<ExcelMonsterRow>("MonsterExcelConfigData"),
    readExcelTable<ExcelFeatureTagGroupRow>("FeatureTagGroupExcelConfigData"),
  );
  const baitRows = readExcelTable<ExcelFishBaitRow>("FishBaitExcelConfigData");
  // The tags the baits that draw by tags weight: a bait naming pools draws their fish instead, so its tags file no fish
  const weightedTags = new Set(
    baitRows
      .filter(({ poolIdList }) => poolIdList.length === 0)
      .flatMap(({ featureList }) => featureList.filter(({ weight }) => weight > 0).map(({ featureTag }) => featureTag)),
  );
  const fish = fishRows.map((row) =>
    toFish(row, toFishCategory(row.monsterId, fishTagsMap.get(row.id) ?? new Set(), weightedTags)),
  );
  const baits = baitRows.map((row) => toFishingBait(row, fishTagsMap, poolIdFishIdsMap));
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
