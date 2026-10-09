import type { ExcelForgeRandomRow } from "#src/models/genshinAssets/forging/ExcelForgeRandomRow";
import type { ExcelForgeRow } from "#src/models/genshinAssets/forging/ExcelForgeRow";
import type { ForgeRecipe } from "genshin-world";

import { ForgeTypeRecipeKindMap } from "#src/services/genshinAssets/forging/constants";
import { toForgeResults } from "#src/services/genshinAssets/forging/toForgeResults";
import { InvalidOperationError, Operation } from "@esposter/shared";

// One forge recipe from its forge row, the diagrams that open it and the random tables its results may draw from, or
// Undefined for a row the blacksmith does not forge, whose results are never read. A recipe hidden until a diagram opens
// It must name one, or the world would never offer it
export const toForgeRecipe = (
  row: ExcelForgeRow,
  unlockItemIds: number[],
  randomRows: ExcelForgeRandomRow[],
): ForgeRecipe | undefined => {
  const kind = ForgeTypeRecipeKindMap[row.forgeType];
  if (kind === undefined) return undefined;
  const materials = row.materialItems.filter(({ id }) => id !== 0).map(({ count, id }) => ({ count, id }));
  if (materials.length === 0) throw new InvalidOperationError(Operation.Read, String(row.id), "takes no material");
  if (!row.isDefaultShow && unlockItemIds.length === 0)
    throw new InvalidOperationError(Operation.Read, String(row.id), "is hidden with no diagram to open it");
  return {
    forgePoint: row.forgePoint,
    forgeType: row.forgeType,
    id: row.id,
    kind,
    materials,
    mora: row.scoinCost,
    playerLevel: row.playerLevel,
    queueSize: row.queueNum,
    results: toForgeResults(row, randomRows),
    seconds: row.forgeTime,
    unlockItemIds,
  };
};
