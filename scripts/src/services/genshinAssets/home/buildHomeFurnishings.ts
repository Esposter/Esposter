import type { ExcelHomeWorldFurnitureRow } from "#src/models/genshinAssets/home/ExcelHomeWorldFurnitureRow";

import { FURNITURE_TABLE_NAME } from "#src/services/genshinAssets/home/constants";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { GameDataset } from "genshin-world";

// The load each furnishing takes up in its area, from the game's furnishing table, as one record of the home dataset: each
// Furnishing by its item id, with the load of its first copy and of each further copy, sorted by that id
export const buildHomeFurnishings = (): Record<string, unknown> => ({
  [`${GameDataset.Home}/furnishings`]: readExcelTable<ExcelHomeWorldFurnitureRow>(FURNITURE_TABLE_NAME)
    .flatMap(({ cost, discountCost, id }) =>
      cost === undefined || discountCost === undefined ? [] : [{ discountLoad: discountCost, itemId: id, load: cost }],
    )
    .toSorted((firstFurnishing, secondFurnishing) => firstFurnishing.itemId - secondFurnishing.itemId),
});
