import type { ForgeRecipe } from "#src/models/forging/ForgeRecipe";
import type { ItemDefinition } from "#src/models/inventory/ItemDefinition";
import type { MaterialData } from "#src/models/inventory/MaterialData";

import { FORGE_ORE_ITEM_IDS } from "#src/services/forging/constants";
import { getItemDefinition } from "#src/services/inventory/getItemDefinition";

// The items the forge's recipes take and yield that the game holds as materials, each by its item id. A weapon is no
// Material, so the forge's weapons name it apart
export const computeForgeDefinitions = (
  recipes: readonly ForgeRecipe[],
  materialDataMap: ReadonlyMap<number, MaterialData>,
  names: Readonly<Record<string, string>>,
): Map<number, ItemDefinition> =>
  new Map(
    [...FORGE_ORE_ITEM_IDS, ...recipes.flatMap(({ results }) => results.map(({ itemId }) => itemId))]
      .filter((itemId) => materialDataMap.has(itemId))
      .map((itemId): [number, ItemDefinition] => [itemId, getItemDefinition(itemId, names, materialDataMap)]),
  );
