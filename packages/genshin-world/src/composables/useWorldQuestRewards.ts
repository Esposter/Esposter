import type { Inventory } from "#src/models/inventory/Inventory";
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { WorldEvents } from "#src/models/world/WorldEvents";
import type { Ref } from "vue";

import { grantQuestRewards } from "#src/services/quest/grantQuestRewards";

// Each quest's finish pays its rewards as it finishes: the bag and the wallet take the items, and the Adventure Rank takes
// The Adventure EXP after them, so the rank reads the wallet they left. A finish is recorded once, so a reload pays nothing
export const useWorldQuestRewards = ({
  events,
  gainAdventureExp,
  inventory,
  materialDataMap,
  names,
  setInventory,
  setWallet,
  wallet,
}: {
  events: WorldEvents;
  gainAdventureExp: (amount: number) => void;
  inventory: Ref<Inventory>;
  materialDataMap: ReadonlyMap<number, MaterialData>;
  names: Readonly<Record<string, string>>;
  setInventory: (nextInventory: Inventory) => void;
  setWallet: (nextWallet: Wallet) => void;
  wallet: Ref<Wallet>;
}) => {
  events.on("finishQuest", ({ rewards }) => {
    const granted = grantQuestRewards(rewards, inventory.value, wallet.value, names, materialDataMap);
    setInventory(granted.inventory);
    setWallet(granted.wallet);
    if (granted.adventureExp > 0) gainAdventureExp(granted.adventureExp);
  });
};
