import type { DroppedItem } from "#src/models/enemy/DroppedItem";
import type { WorldBagDependencies } from "#src/models/world/WorldBagDependencies";
import type { WorldDrop } from "#src/models/world/WorldDrop";

// What a world composable that offers to a shrine pays its rewards through: the bag and the wallet, the Adventure EXP and
// The drops the rewards overflow onto, and the game data its levels are read from
export interface WorldOfferingDependencies extends WorldBagDependencies {
  gainWorldAdventureExp: (amount: number) => void;
  gameDataBaseUrl: string;
  placeWorldDrops: (source: Pick<WorldDrop, "id" | "position">, droppedItems: DroppedItem[]) => void;
}
