import type { ExcelBlossomGroupRow } from "#src/models/genshinAssets/leyLine/ExcelBlossomGroupRow";
import type { ExcelBlossomRefreshRow } from "#src/models/genshinAssets/leyLine/ExcelBlossomRefreshRow";
import type { ExcelBlossomSectionOrderRow } from "#src/models/genshinAssets/leyLine/ExcelBlossomSectionOrderRow";
import type { ExcelRewardPreviewRow } from "#src/models/genshinAssets/shared/ExcelRewardPreviewRow";
import type { OutcropRegion } from "genshin-world";

import { toKindRules } from "#src/services/genshinAssets/leyLine/toKindRules";
import { toOutcropRegion } from "#src/services/genshinAssets/leyLine/toOutcropRegion";

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
