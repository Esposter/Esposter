import type { ExcelForgeRow } from "#src/models/genshinAssets/forging/ExcelForgeRow";
import type { ForgeRecipe } from "genshin-world";

import { ForgeTypeRecipeKindMap } from "#src/services/genshinAssets/forging/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";

// One forge recipe from its forge row and the diagrams that open it, or undefined for a row the blacksmith does not forge.
// A result of id zero is a drop table's, which the build does not read, so it is left out. A recipe hidden until a diagram
// Opens it must name one, or the world would never offer it
export const toForgeRecipe = (row: ExcelForgeRow, unlockItemIds: number[]): ForgeRecipe | undefined => {
  const kind = ForgeTypeRecipeKindMap[row.forgeType];
  if (kind === undefined || row.resultItemId === 0) return undefined;
  const materials = row.materialItems.filter(({ id }) => id !== 0).map(({ count, id }) => ({ count, id }));
  if (materials.length === 0) throw new InvalidOperationError(Operation.Read, String(row.id), "takes no material");
  if (!row.isDefaultShow && unlockItemIds.length === 0)
    throw new InvalidOperationError(Operation.Read, String(row.id), "is hidden with no diagram to open it");
  return {
    forgePoint: row.forgePoint,
    id: row.id,
    kind,
    materials,
    mora: row.scoinCost,
    playerLevel: row.playerLevel,
    queueSize: row.queueNum,
    resultCount: row.resultItemCount,
    resultItemId: row.resultItemId,
    seconds: row.forgeTime,
    unlockItemIds,
  };
};
