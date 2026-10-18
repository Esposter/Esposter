import type { ExcelHomeWorldAreaComfortRow } from "#src/models/genshinAssets/home/ExcelHomeWorldAreaComfortRow";

import { AREA_COMFORT_TABLE_NAME } from "#src/services/genshinAssets/home/constants";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { GameDataset } from "genshin-world";

// The load each realm area holds at most, from the game's area table, as one record of the home dataset: each area by its
// Scene and its id within the scene, sorted by both
export const buildHomeAreas = (): Record<string, unknown> => ({
  [`${GameDataset.Home}/areas`]: readExcelTable<ExcelHomeWorldAreaComfortRow>(AREA_COMFORT_TABLE_NAME)
    .map(({ MMLKIBLLOGP, areaID, sceneID }) => ({ areaId: areaID, loadLimit: MMLKIBLLOGP, sceneId: sceneID }))
    .toSorted(
      (firstArea, secondArea) => firstArea.sceneId - secondArea.sceneId || firstArea.areaId - secondArea.areaId,
    ),
});
