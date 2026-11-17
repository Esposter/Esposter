import type { InventoryItem } from "#src/models/inventory/InventoryItem";
import type { InventoryItemLearning } from "#src/models/inventory/InventoryItemLearning";
import type { InventoryUseContext } from "#src/models/inventory/InventoryUseContext";

import { checkIsCookingRecipeOpen } from "#src/services/cooking/checkIsCookingRecipeOpen";
import { learnCookingRecipe } from "#src/services/cooking/learnCookingRecipe";
import { learnCraftingRecipe } from "#src/services/crafting/learnCraftingRecipe";
import { learnForgeRecipe } from "#src/services/forging/learnForgeRecipe";
import { learnHomeBlueprint } from "#src/services/home/learnHomeBlueprint";

// What an item of the bag teaches when it is used: a cooking instruction, a forge diagram, a crafting instruction or a
// Blueprint's diagram, by the item's id. Undefined where the item teaches none. Every kind is routed here, so the check that
// Offers the Use and the use itself read the same kind and cannot disagree about it
export const getInventoryItemLearning = (
  { definition: { id } }: InventoryItem,
  {
    blueprintMap,
    cookingProgress,
    craftingProgress,
    craftingRecipeMap,
    forgeProgress,
    forgeRecipeMap,
    homeProgress,
    instructionRecipeMap,
  }: InventoryUseContext,
): InventoryItemLearning | undefined => {
  const instructionRecipe = instructionRecipeMap.get(id);
  if (instructionRecipe !== undefined)
    return {
      isOpen: checkIsCookingRecipeOpen(instructionRecipe, cookingProgress),
      learn: (inventory) => {
        const learned = learnCookingRecipe(instructionRecipe, id, { inventory, progress: cookingProgress });
        return learned === undefined ? undefined : { cookingProgress: learned.progress, inventory: learned.inventory };
      },
    };
  const forgeRecipe = forgeRecipeMap.get(id);
  if (forgeRecipe !== undefined)
    return {
      isOpen: forgeProgress.learnedRecipeIds.includes(forgeRecipe.id),
      learn: (inventory) => {
        const learned = learnForgeRecipe(forgeRecipe, id, { inventory, progress: forgeProgress });
        return learned === undefined ? undefined : { forgeProgress: learned.progress, inventory: learned.inventory };
      },
    };
  const craftingRecipe = craftingRecipeMap.get(id);
  if (craftingRecipe !== undefined)
    return {
      isOpen: craftingProgress.learnedRecipeIds.includes(craftingRecipe.id),
      learn: (inventory) => {
        const learned = learnCraftingRecipe(craftingRecipe, id, { inventory, progress: craftingProgress });
        return learned === undefined ? undefined : { craftingProgress: learned.progress, inventory: learned.inventory };
      },
    };
  const blueprint = blueprintMap.get(id);
  if (blueprint !== undefined)
    return {
      isOpen: homeProgress.learnedBlueprintIds.includes(blueprint.id),
      learn: (inventory) => {
        const learned = learnHomeBlueprint(blueprint, id, { inventory, progress: homeProgress });
        return learned === undefined ? undefined : { homeProgress: learned.progress, inventory: learned.inventory };
      },
    };
  return undefined;
};
