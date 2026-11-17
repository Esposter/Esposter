import type { Inventory } from "#src/models/inventory/Inventory";

import { learnByDiagram } from "#src/services/shared/learnByDiagram";

// The bag and progress after a recipe or blueprint is learned by using one of its diagrams, its learned ids held under
// `learnedKey` of the progress. Undefined, with nothing used, where the same conditions as `learnByDiagram` refuse it
export const learnByDiagramInProgress = <Key extends string, Progress extends Record<Key, number[]>>(
  { id, unlockItemIds }: { id: number; unlockItemIds: number[] },
  diagramItemId: number,
  { inventory, progress }: { inventory: Inventory; progress: Progress },
  learnedKey: Key,
): undefined | { inventory: Inventory; progress: Progress } => {
  const learned = learnByDiagram({ id, learnedIds: progress[learnedKey], unlockItemIds }, diagramItemId, inventory);
  return learned && { inventory: learned.inventory, progress: { ...progress, [learnedKey]: learned.learnedIds } };
};
