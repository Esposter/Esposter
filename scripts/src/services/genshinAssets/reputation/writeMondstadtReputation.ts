import type { ExcelHuntingRefreshRow } from "#src/models/genshinAssets/reputation/ExcelHuntingRefreshRow";
import type { ExcelReputationCityRow } from "#src/models/genshinAssets/reputation/ExcelReputationCityRow";
import type { ExcelReputationLevelRow } from "#src/models/genshinAssets/reputation/ExcelReputationLevelRow";
import type { ExcelReputationRequestRow } from "#src/models/genshinAssets/reputation/ExcelReputationRequestRow";
import type { ExcelRewardRow } from "#src/models/genshinAssets/rewards/ExcelRewardRow";

import {
  MONDSTADT_REPUTATION_PATH,
  REPUTATION_GENERATED_DIRECTORY,
} from "#src/services/genshinAssets/reputation/constants";
import { toReputationReward } from "#src/services/genshinAssets/reputation/toReputationReward";
import { readRewardMap } from "#src/services/genshinAssets/rewards/readRewardMap";
import { readExcelTable } from "#src/services/genshinAssets/stats/readExcelTable";
import { MONDSTADT_CITY_ID } from "#src/services/genshinAssets/statues/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { mkdirSync, writeFileSync } from "node:fs";

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
// Mondstadt's Reputation from the dump: its levels with each level's reward, the requests of the groups its levels name
// And its weekly bounties, each reward split into the Reputation EXP and the items it also gives. Written as one slice in
// The world's generated folder
export const writeMondstadtReputation = (): void => {
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
      difficulty: bountyRow.difficulty,
      id: bountyRow.id,
      regionId: bountyRow.regionId,
      reward: toReputationReward(
        readReward(rewardMap, bountyRow.finishRewardId, `bounty ${bountyRow.id}`),
        city.virtualItemId,
      ),
    }));
  mkdirSync(REPUTATION_GENERATED_DIRECTORY, { recursive: true });
  writeFileSync(MONDSTADT_REPUTATION_PATH, `${JSON.stringify({ bounties, levels, requests }, undefined, 2)}\n`);
};
