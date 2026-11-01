import type { ExcelBlossomGroupRow } from "#src/models/genshinAssets/leyLine/ExcelBlossomGroupRow";
import type { ExcelBlossomRefreshRow } from "#src/models/genshinAssets/leyLine/ExcelBlossomRefreshRow";
import type { ExcelBlossomSectionOrderRow } from "#src/models/genshinAssets/leyLine/ExcelBlossomSectionOrderRow";
import type { ExcelRewardPreviewRow } from "#src/models/genshinAssets/shared/ExcelRewardPreviewRow";
import type { OutcropPlace, OutcropRegion } from "genshin-world";

import { toKindRules } from "#src/services/genshinAssets/leyLine/toKindRules";

// One city's region: its kinds' rules, every place its groups name, and the sections its outcrops are drawn from in the
// Order the game lists them, the sections without a place left out
export const toOutcropRegion = (
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
