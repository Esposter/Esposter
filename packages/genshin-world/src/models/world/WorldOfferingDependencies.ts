import type { DroppedItem } from "#src/models/enemy/DroppedItem";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { WorldDrop } from "#src/models/world/WorldDrop";
import type { Ref } from "vue";

// What a world composable that offers to a shrine pays its rewards through: the bag and the wallet, the Adventure EXP and
// The drops the rewards overflow onto, and the game data its levels are read from
export interface WorldOfferingDependencies {
  gainWorldAdventureExp: (amount: number) => void;
  gameDataBaseUrl: string;
  inventory: Ref<Inventory>;
  materialDataMap: ReadonlyMap<number, MaterialData>;
  nameText: Readonly<Record<string, string>>;
  placeWorldDrops: (source: Pick<WorldDrop, "id" | "position">, droppedItems: DroppedItem[]) => void;
  setInventory: (nextInventory: Inventory) => void;
  setWallet: (nextWallet: Wallet) => void;
  wallet: Ref<Wallet>;
}
