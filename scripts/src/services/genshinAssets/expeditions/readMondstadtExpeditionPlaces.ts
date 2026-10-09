import type { ExcelExpeditionDataRow } from "#src/models/genshinAssets/expeditions/ExcelExpeditionDataRow";
import type { ExcelRewardPreviewRow } from "#src/models/genshinAssets/expeditions/ExcelRewardPreviewRow";
import type { ExpeditionPlaceRow } from "#src/models/genshinAssets/expeditions/ExpeditionPlaceRow";

import { MONDSTADT_CITY_ID } from "#src/services/genshinAssets/expeditions/constants";
import { toExpeditionPlaceRow } from "#src/services/genshinAssets/expeditions/toExpeditionPlaceRow";
import { readExcelTable } from "#src/services/genshinAssets/stats/readExcelTable";

// Mondstadt's expedition places, each read from the game's expedition table and its reward previews in the text dump
export const readMondstadtExpeditionPlaces = (): ExpeditionPlaceRow[] => {
  const rewardPreviews = new Map(
    readExcelTable<ExcelRewardPreviewRow>("RewardPreviewExcelConfigData").map((preview) => [preview.id, preview]),
  );
  return readExcelTable<ExcelExpeditionDataRow>("ExpeditionDataExcelConfigData")
    .filter(({ cityId }) => cityId === MONDSTADT_CITY_ID)
    .map((row) => toExpeditionPlaceRow(row, rewardPreviews))
    .toSorted((firstPlace, secondPlace) => firstPlace.id - secondPlace.id);
};
