import type { BuffRow } from "#src/models/genshinAssets/cooking/BuffRow";
import type { MaterialRow } from "#src/models/genshinAssets/items/MaterialRow";

import { BUFF_TABLE_NAME } from "#src/services/genshinAssets/cooking/constants";
import { readCookingRecipes } from "#src/services/genshinAssets/cooking/readCookingRecipes";
import { toDishUse } from "#src/services/genshinAssets/cooking/toDishUse";
import { MATERIAL_TABLE_NAME } from "#src/services/genshinAssets/items/constants";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { GameDataset } from "genshin-world";

// The use each dish gives when it is eaten, by the dish's item id, for every item a cook recipe yields that heals. A dish
// That heals nothing is left out, and a dish's item the material table lacks is an error
export const buildDishes = (): Record<string, unknown> => {
  const materialMap = new Map(readExcelTable<MaterialRow>(MATERIAL_TABLE_NAME).map((row) => [row.id, row]));
  const buffRows = readExcelTable<BuffRow>(BUFF_TABLE_NAME);
  const dishItemIds = new Set(readCookingRecipes().flatMap(({ resultItemIds }) => Object.values(resultItemIds)));
  const dishes = [...dishItemIds].flatMap((itemId) => {
    const materialRow = materialMap.get(itemId);
    if (!materialRow)
      throw new InvalidOperationError(Operation.Read, String(itemId), "has no row in the material table");
    const dishUse = toDishUse(materialRow, buffRows);
    return dishUse === undefined ? [] : [[String(itemId), dishUse] as const];
  });
  return { [`${GameDataset.Cooking}/dishes`]: Object.fromEntries(dishes) };
};
