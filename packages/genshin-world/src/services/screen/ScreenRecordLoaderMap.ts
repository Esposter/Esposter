import type { ScreenRecords } from "#src/models/screen/ScreenRecords";

import { ScreenRecordKey } from "#src/models/screen/ScreenRecordKey";
import { readCraftingRecipes } from "#src/services/crafting/readCraftingRecipes";

// Each record's reader, by its key, which reads it from the game data's base
export const ScreenRecordLoaderMap: {
  [K in ScreenRecordKey]: (gameDataBaseUrl: string) => Promise<ScreenRecords[K]>;
} = { [ScreenRecordKey.CraftingRecipes]: readCraftingRecipes };
