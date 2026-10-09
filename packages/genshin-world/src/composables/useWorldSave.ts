import type { Inventory } from "#src/models/inventory/Inventory";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { GenshinSaveState } from "#src/models/save/GenshinSaveState";
import type { WorldEvents } from "#src/models/world/WorldEvents";

// The bag and the wallet the player holds, and the wishes' counters: every change to either is a grant the host saves at
// Once, and every change to the bag is announced to the systems that read what it takes in
export const useWorldSave = ({
  emitGrant,
  events,
  savedState,
}: {
  emitGrant: () => void;
  events: WorldEvents;
  savedState: Pick<GenshinSaveState, "inventory" | "wallet" | "wishPityMap">;
}) => {
  const inventory = ref<Inventory>(savedState.inventory);
  const wallet = ref<Wallet>(savedState.wallet);
  const wishPityMap = ref(savedState.wishPityMap);
  // Every change to the bag goes through here, so the Archive opens the entries of what the bag takes in
  const setInventory = (nextInventory: Inventory) => {
    inventory.value = nextInventory;
    events.emit("bagChange", nextInventory);
    emitGrant();
  };
  // Every change to the wallet goes through here, as the bag's does, so a grant or a purchase is saved at once
  const setWallet = (nextWallet: Wallet) => {
    wallet.value = nextWallet;
    emitGrant();
  };
  return { inventory, setInventory, setWallet, wallet, wishPityMap };
};
