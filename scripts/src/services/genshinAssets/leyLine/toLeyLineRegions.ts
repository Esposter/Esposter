import type { ExcelRewardPreviewRow } from "#src/models/genshinAssets/expeditions/ExcelRewardPreviewRow";
import type { ExcelBlossomGroupRow } from "#src/models/genshinAssets/leyLine/ExcelBlossomGroupRow";
import type { ExcelBlossomRefreshReward } from "#src/models/genshinAssets/leyLine/ExcelBlossomRefreshReward";
import type { ExcelBlossomRefreshRow } from "#src/models/genshinAssets/leyLine/ExcelBlossomRefreshRow";
import type { ExcelBlossomSectionOrderRow } from "#src/models/genshinAssets/leyLine/ExcelBlossomSectionOrderRow";
import type { OutcropKindRule, OutcropPlace, OutcropRegion } from "genshin-world";

import {
  AREA_UNLOCK_CONDITION_TYPE,
  LeyLineRefreshKindMap,
  PLAYER_LEVEL_CONDITION_TYPE,
} from "#src/services/genshinAssets/leyLine/constants";
import { toPreviewItems } from "#src/services/genshinAssets/rewards/toPreviewItems";
import { InvalidOperationError, Operation, takeOne } from "@esposter/shared";

// Each World Level's reward row, the items of the reward preview each listed reward names, in the order it lists them
const toWorldLevelRewards = (
  rewards: ExcelBlossomRefreshReward[],
  refreshType: string,
  rewardPreviews: ReadonlyMap<number, ExcelRewardPreviewRow>,
): OutcropKindRule["worldLevelRewards"] =>
  rewards.map(({ DANEGNOIKLH: previewId }) => {
    const rewardPreview = rewardPreviews.get(previewId);
    if (!rewardPreview)
      throw new InvalidOperationError(Operation.Read, refreshType, `has no reward preview ${previewId}`);
    return toPreviewItems(rewardPreview);
  });

// The kind rules a blossom refresh row opens: one for a ley line kind, none for a refresh that is not one
const toKindRules = (
  { KNHAALNEMLL, OFGHJMOLMNA, refreshType }: ExcelBlossomRefreshRow,
  rewardPreviews: ReadonlyMap<number, ExcelRewardPreviewRow>,
): OutcropKindRule[] => {
  const kind = LeyLineRefreshKindMap[refreshType];
  const playerLevelCondition = KNHAALNEMLL.find(({ type }) => type === PLAYER_LEVEL_CONDITION_TYPE);
  if (kind === undefined || playerLevelCondition === undefined) return [];
  return [
    {
      kind,
      playerLevel: takeOne(playerLevelCondition.param, 0),
      unlockCityIds: KNHAALNEMLL.filter(({ type }) => type === AREA_UNLOCK_CONDITION_TYPE).map(({ param }) =>
        takeOne(param, 0),
      ),
      worldLevelRewards: toWorldLevelRewards(OFGHJMOLMNA, refreshType, rewardPreviews),
    },
  ];
};

// One city's region: its kinds' rules, every place its groups name, and the sections its outcrops are drawn from in the
// Order the game lists them, the sections without a place left out
const toOutcropRegion = (
  cityId: number,
  refreshRows: ExcelBlossomRefreshRow[],
  groupRows: ExcelBlossomGroupRow[],
  sectionOrderRows: ExcelBlossomSectionOrderRow[],
  rewardPreviews: ReadonlyMap<number, ExcelRewardPreviewRow>,
): OutcropRegion => {
  const places: OutcropPlace[] = groupRows
    .filter((row) => row.cityId === cityId)
    .map(({ id, nextCampIdVec, sectionId }) => ({ id, nextIds: nextCampIdVec, sectionId }))
    .toSorted((firstPlace, secondPlace) => firstPlace.id - secondPlace.id);
  const sectionIds = sectionOrderRows
    .filter((row) => row.cityId === cityId)
    .toSorted((firstRow, secondRow) => firstRow.order - secondRow.order)
    .map(({ sectionId }) => sectionId)
    .filter((sectionId) => places.some((place) => place.sectionId === sectionId));
  const kinds = refreshRows.filter((row) => row.cityId === cityId).flatMap((row) => toKindRules(row, rewardPreviews));
  return { kinds, places, sectionIds };
};

// Every city with a ley line kind, its region as the game's blossom tables give it, keyed by the city's id in ascending order
export const toLeyLineRegions = (
  refreshRows: ExcelBlossomRefreshRow[],
  groupRows: ExcelBlossomGroupRow[],
  sectionOrderRows: ExcelBlossomSectionOrderRow[],
  rewardPreviewRows: ExcelRewardPreviewRow[],
): Map<number, OutcropRegion> => {
  const rewardPreviews = new Map(rewardPreviewRows.map((preview) => [preview.id, preview]));
  const cityIds = [
    ...new Set(refreshRows.filter((row) => toKindRules(row, rewardPreviews).length > 0).map(({ cityId }) => cityId)),
  ];
  return new Map(
    cityIds
      .toSorted((firstCityId, secondCityId) => firstCityId - secondCityId)
      .map((cityId): [number, OutcropRegion] => [
        cityId,
        toOutcropRegion(cityId, refreshRows, groupRows, sectionOrderRows, rewardPreviews),
      ]),
  );
};
