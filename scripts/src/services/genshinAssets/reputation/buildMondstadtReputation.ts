import type { ExcelHuntingRefreshRow } from "#src/models/genshinAssets/reputation/ExcelHuntingRefreshRow";
import type { ExcelHuntingRegionRow } from "#src/models/genshinAssets/reputation/ExcelHuntingRegionRow";
import type { ExcelReputationCityRow } from "#src/models/genshinAssets/reputation/ExcelReputationCityRow";
import type { ExcelReputationExploreRow } from "#src/models/genshinAssets/reputation/ExcelReputationExploreRow";
import type { ExcelReputationLevelRow } from "#src/models/genshinAssets/reputation/ExcelReputationLevelRow";
import type { ExcelReputationRequestRow } from "#src/models/genshinAssets/reputation/ExcelReputationRequestRow";
import type { ExcelRewardRow } from "#src/models/genshinAssets/rewards/ExcelRewardRow";

import {
  DEFAULT_HUNTING_DIFFICULTY,
  MONDSTADT_BOUNTY_TARGET_NAMES,
} from "#src/services/genshinAssets/reputation/constants";
import { readMonsterNames } from "#src/services/genshinAssets/reputation/readMonsterNames";
import { toBountyTargetIds } from "#src/services/genshinAssets/reputation/toBountyTargetIds";
import { toReputationReward } from "#src/services/genshinAssets/reputation/toReputationReward";
import { readRewardMap } from "#src/services/genshinAssets/rewards/readRewardMap";
import { MONDSTADT_CITY_ID } from "#src/services/genshinAssets/statues/constants";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { GameDataset } from "genshin-world";

// The reward a row names, read from the reward table, an unlisted one being an error since a level, request or bounty
// Without its reward would pay silently wrong
const readReward = (rewardMap: Map<number, ExcelRewardRow>, rewardId: number, owner: string): ExcelRewardRow => {
  const reward = rewardMap.get(rewardId);
  if (!reward)
    throw new InvalidOperationError(
      Operation.Read,
      "reputation reward",
      `${owner} names reward ${rewardId}, which the reward table does not hold`,
    );
  return reward;
};
// Mondstadt's Reputation from the dump: its levels with each level's reward, the requests of the groups its levels name,
// Its exploration thresholds, its weekly bounties with each difficulty's possible targets and the regions they spawn in,
// And each reward split into the Reputation EXP and the items it also gives.
// Published as one record of the reputation dataset, keyed by Mondstadt
export const buildMondstadtReputation = (): Record<string, unknown> => {
  const city = readExcelTable<ExcelReputationCityRow>("ReputationCityExcelConfigData").find(
    ({ cityId }) => cityId === MONDSTADT_CITY_ID,
  );
  if (!city)
    throw new InvalidOperationError(Operation.Read, "reputation city", `the dump holds no city ${MONDSTADT_CITY_ID}`);
  const rewardMap = readRewardMap();
  const levelRows = readExcelTable<ExcelReputationLevelRow>("ReputationLevelExcelConfigData")
    .filter(({ cityId }) => cityId === MONDSTADT_CITY_ID)
    .toSorted((firstLevel, secondLevel) => firstLevel.level - secondLevel.level);
  const requestGroupIds = new Set(levelRows.map(({ requestGroupId }) => requestGroupId));
  const levels = levelRows.map((levelRow) => ({
    functionIds: levelRow.functionId ? [levelRow.functionId] : [],
    goodsIds: levelRow.goodsId ? [levelRow.goodsId] : [],
    level: levelRow.level,
    nextLevelExp: levelRow.nextLevelExp,
    requestGroupId: levelRow.requestGroupId,
    reward: toReputationReward(readReward(rewardMap, levelRow.rewardId, `level ${levelRow.level}`), city.virtualItemId),
  }));
  const requests = readExcelTable<ExcelReputationRequestRow>("ReputationRequestExcelConfigData")
    .filter(({ groupId }) => requestGroupIds.has(groupId))
    .toSorted((firstRequest, secondRequest) => firstRequest.requestId - secondRequest.requestId)
    .map((requestRow) => ({
      groupId: requestRow.groupId,
      questId: requestRow.questId,
      requestId: requestRow.requestId,
      reward: toReputationReward(
        readReward(rewardMap, requestRow.rewardId, `request ${requestRow.requestId}`),
        city.virtualItemId,
      ),
      weight: requestRow.weight,
    }));
  const bounties = readExcelTable<ExcelHuntingRefreshRow>("HuntingRefreshExcelConfigData")
    .filter(({ cityId }) => cityId === MONDSTADT_CITY_ID)
    .toSorted((firstBounty, secondBounty) => firstBounty.id - secondBounty.id)
    .map((bountyRow) => ({
      difficulty: bountyRow.difficulty ?? DEFAULT_HUNTING_DIFFICULTY,
      id: bountyRow.id,
      regionId: bountyRow.regionId,
      reward: toReputationReward(
        readReward(rewardMap, bountyRow.finishRewardId, `bounty ${bountyRow.id}`),
        city.virtualItemId,
      ),
    }));
  // Each difficulty's possible targets, the wiki's names resolved to monsters, and the hunting regions the bounties name,
  // Kept only where the dump places one, since a region it leaves unplaced spawns no target
  const monsterNames = readMonsterNames();
  const bountyTargets = Object.entries(MONDSTADT_BOUNTY_TARGET_NAMES).map(([difficulty, names]) => ({
    difficulty,
    enemyKindIds: toBountyTargetIds(names, monsterNames),
  }));
  const bountyRegionIds = new Set(bounties.map(({ regionId }) => regionId));
  const huntingRegions = readExcelTable<ExcelHuntingRegionRow>("HuntingRegionExcelConfigData")
    .filter(({ centerPosList, id }) => bountyRegionIds.has(id) && centerPosList.length === 3)
    .toSorted((firstRegion, secondRegion) => firstRegion.id - secondRegion.id)
    .map(({ centerPosList, centerRadius, id }) => ({ center: centerPosList, id, radius: centerRadius }));
  const explores = readExcelTable<ExcelReputationExploreRow>("ReputationExploreExcelConfigData")
    .filter(({ cityId }) => cityId === MONDSTADT_CITY_ID)
    .toSorted((firstExplore, secondExplore) => firstExplore.exploreProgress - secondExplore.exploreProgress)
    .map((exploreRow) => ({
      exploreId: exploreRow.exploreId,
      exploreProgress: exploreRow.exploreProgress,
      reward: toReputationReward(
        readReward(rewardMap, exploreRow.rewardId, `exploration ${exploreRow.exploreId}`),
        city.virtualItemId,
      ),
    }));
  return {
    [`${GameDataset.Reputation}/mondstadt`]: { bounties, bountyTargets, explores, huntingRegions, levels, requests },
  };
};
