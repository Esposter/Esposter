import type { ExcelFurnitureMakeRow } from "#src/models/genshinAssets/home/ExcelFurnitureMakeRow";
import type { HomeBlueprint } from "genshin-world";

import { InvalidOperationError, Operation } from "@esposter/shared";

// One furnishing blueprint from its making row and the diagrams that open it. A slot a blueprint leaves empty is left out, and
// A blueprint makes one furnishing an order, so a row making more is refused rather than read as one a unit
export const toHomeBlueprint = (row: ExcelFurnitureMakeRow, unlockItemIds: number[]): HomeBlueprint => {
  if (row.count !== 1)
    throw new InvalidOperationError(Operation.Read, String(row.furnitureItemID), "makes more than one");
  const materials = row.materialItems.filter(({ id }) => id !== 0).map(({ count, id }) => ({ count, id }));
  if (materials.length === 0)
    throw new InvalidOperationError(Operation.Read, String(row.furnitureItemID), "takes no material");
  return { id: row.furnitureItemID, materials, seconds: row.makeTime, trustExp: row.exp, unlockItemIds };
};
