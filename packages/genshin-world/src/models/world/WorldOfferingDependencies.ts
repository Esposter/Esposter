import type { DroppedItem } from "#src/models/enemy/DroppedItem";
import type { WorldDrop } from "#src/models/world/WorldDrop";

// What a world composable that offers to a shrine pays its rewards through, beside the bag and the wallet in the session
// Store: the Adventure EXP and the drops the rewards overflow onto
export interface WorldOfferingDependencies {
  placeWorldDrops: (source: Pick<WorldDrop, "id" | "position">, droppedItems: DroppedItem[]) => void;
}
