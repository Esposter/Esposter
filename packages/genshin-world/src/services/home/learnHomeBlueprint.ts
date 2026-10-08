import type { HomeBlueprint } from "#src/models/home/HomeBlueprint";
import type { HomeProgress } from "#src/models/home/HomeProgress";
import type { Inventory } from "#src/models/inventory/Inventory";

import { learnByDiagram } from "#src/services/shared/learnByDiagram";

// The bag and progress after a blueprint is learned by using one of its diagrams, the diagram taken from the bag. Undefined,
// With nothing used, where the item is not one of the blueprint's diagrams, is not held, or it is learned already
export const learnHomeBlueprint = (
  blueprint: HomeBlueprint,
  diagramItemId: number,
  { inventory, progress }: { inventory: Inventory; progress: HomeProgress },
): undefined | { inventory: Inventory; progress: HomeProgress } => {
  const learned = learnByDiagram(
    { id: blueprint.id, learnedIds: progress.learnedBlueprintIds, unlockItemIds: blueprint.unlockItemIds },
    diagramItemId,
    inventory,
  );
  return (
    learned && { inventory: learned.inventory, progress: { ...progress, learnedBlueprintIds: learned.learnedIds } }
  );
};
