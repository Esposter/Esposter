import type { ExcelBlossomGroupRow } from "#src/models/genshinAssets/leyLine/ExcelBlossomGroupRow";
import type { ExcelBlossomRefreshRow } from "#src/models/genshinAssets/leyLine/ExcelBlossomRefreshRow";
import type { ExcelBlossomSectionOrderRow } from "#src/models/genshinAssets/leyLine/ExcelBlossomSectionOrderRow";
import type { OutcropKindRule, OutcropPlace, OutcropRegion } from "genshin-world";

import {
  AREA_UNLOCK_CONDITION_TYPE,
  LeyLineRefreshKindMap,
  PLAYER_LEVEL_CONDITION_TYPE,
} from "#src/services/genshinAssets/leyLine/constants";
import { takeOne } from "@esposter/shared";

// The kind rules a blossom refresh row opens: one for a ley line kind, none for a refresh that is not one
const toKindRules = ({ HGBNAGMEAFI, refreshType }: ExcelBlossomRefreshRow): OutcropKindRule[] => {
  const kind = LeyLineRefreshKindMap[refreshType];
  const playerLevelCondition = HGBNAGMEAFI.find(({ type }) => type === PLAYER_LEVEL_CONDITION_TYPE);
  if (kind === undefined || playerLevelCondition === undefined) return [];
  return [
    {
      kind,
      playerLevel: takeOne(playerLevelCondition.param, 0),
      unlockCityIds: HGBNAGMEAFI.filter(({ type }) => type === AREA_UNLOCK_CONDITION_TYPE).map(({ param }) =>
        takeOne(param, 0),
      ),
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
  const kinds = refreshRows.filter((row) => row.cityId === cityId).flatMap((row) => toKindRules(row));
  return { kinds, places, sectionIds };
};

// Every city with a ley line kind, its region as the game's blossom tables give it, keyed by the city's id in ascending order
export const toLeyLineRegions = (
  refreshRows: ExcelBlossomRefreshRow[],
  groupRows: ExcelBlossomGroupRow[],
  sectionOrderRows: ExcelBlossomSectionOrderRow[],
): Map<number, OutcropRegion> => {
  const cityIds = [...new Set(refreshRows.filter((row) => toKindRules(row).length > 0).map(({ cityId }) => cityId))];
  return new Map(
    cityIds
      .toSorted((firstCityId, secondCityId) => firstCityId - secondCityId)
      .map((cityId): [number, OutcropRegion] => [
        cityId,
        toOutcropRegion(cityId, refreshRows, groupRows, sectionOrderRows),
      ]),
  );
};
