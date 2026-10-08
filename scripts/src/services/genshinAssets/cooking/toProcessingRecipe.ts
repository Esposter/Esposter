import type { CompoundRow } from "#src/models/genshinAssets/cooking/CompoundRow";
import type { ProcessingRecipe } from "genshin-world";

import { COMPOUND_COOK_TYPE } from "#src/services/genshinAssets/cooking/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";

// One processing from its compound row: its ingredients, the one item and count it makes, the seconds a unit takes, how
// Many may be queued, its rank and whether it is known from the start. A row of another type, or with no ingredient, is
// Not written; a row of this type making nothing is an error
export const toProcessingRecipe = (row: CompoundRow): ProcessingRecipe | undefined => {
  if (row.type !== COMPOUND_COOK_TYPE) return undefined;
  const ingredients = row.inputVec.filter(({ count }) => count > 0).map(({ count, id }) => ({ count, id }));
  const output = row.outputVec.find(({ count }) => count > 0);
  if (ingredients.length === 0 || output === undefined)
    throw new InvalidOperationError(Operation.Read, String(row.id), "takes no ingredient or makes no result");
  return {
    costTime: row.costTime,
    id: row.id,
    ingredients,
    isDefaultUnlocked: row.isDefaultUnlocked,
    queueSize: row.queueSize,
    rankLevel: row.rankLevel,
    result: { count: output.count, id: output.id },
  };
};
