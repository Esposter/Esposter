import type { ExcelHomeWorldFarmFieldRow } from "#src/models/genshinAssets/home/ExcelHomeWorldFarmFieldRow";
import type { ExcelHomeWorldPlantRow } from "#src/models/genshinAssets/home/ExcelHomeWorldPlantRow";

import { FARM_FIELD_TABLE_NAME, PLANT_TABLE_NAME } from "#src/services/genshinAssets/home/constants";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { GameDataset } from "genshin-world";

// The garden's fields and the seeds each plant, from the game's tables, as one record of the home dataset: each field by its
// Furnishing's item id, each plant by its seed's, and each record sorted by that id
export const buildHomeGardens = (): Record<string, unknown> => ({
  [`${GameDataset.Home}/gardens`]: {
    fields: readExcelTable<ExcelHomeWorldFarmFieldRow>(FARM_FIELD_TABLE_NAME)
      .map(({ fieldItemID, fieldSlotNum }) => ({ fieldItemId: fieldItemID, slotCount: fieldSlotNum }))
      .toSorted((firstField, secondField) => firstField.fieldItemId - secondField.fieldItemId),
    plants: readExcelTable<ExcelHomeWorldPlantRow>(PLANT_TABLE_NAME)
      .map(({ fieldID, seedID, time }) => ({ fieldItemId: fieldID, seconds: time, seedItemId: seedID }))
      .toSorted((firstPlant, secondPlant) => firstPlant.seedItemId - secondPlant.seedItemId),
  },
});
