import type { ExcelHomeWorldAreaComfortRow } from "#src/models/genshinAssets/home/ExcelHomeWorldAreaComfortRow";

import { AREA_COMFORT_TABLE_NAME } from "#src/services/genshinAssets/home/constants";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { GameDataset } from "genshin-world";

// The load each realm area holds at most, whether it is an exterior area and the loads its meter turns orange and red at,
// From the game's area table, as one record of the home dataset: each area by its scene and its id within the scene, sorted
// By both
export const buildHomeAreas = (): Record<string, unknown> => ({
  [`${GameDataset.Home}/areas`]: readExcelTable<ExcelHomeWorldAreaComfortRow>(AREA_COMFORT_TABLE_NAME)
    .map(({ areaID, areaType, highLoadLimit, lowLoadLimit, MMLKIBLLOGP, sceneID }) => ({
      areaId: areaID,
      exterior: areaType === "ExteriorArea",
      loadLimit: MMLKIBLLOGP,
      orangeLoad: highLoadLimit,
      redLoad: lowLoadLimit,
      sceneId: sceneID,
    }))
    .toSorted(
      (firstArea, secondArea) => firstArea.sceneId - secondArea.sceneId || firstArea.areaId - secondArea.areaId,
    ),
});
