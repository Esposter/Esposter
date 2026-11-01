import type { Inventory } from "#src/models/inventory/Inventory";
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { Resident } from "#src/models/world/Resident";
import type { Ref } from "vue";

// What the card game's reward is paid from and into: the card game's EXP and the games already paid as the save holds
// Them, the residents a week game is read off, and the bag and wallet the reward is paid into
export interface WorldCardGameOptions {
  getResidents: () => Resident[];
  inventory: Readonly<Ref<Inventory>>;
  materialDataMap: ReadonlyMap<number, MaterialData>;
  nameText: Readonly<Record<string, string>>;
  savedCardGameExp: number;
  savedRewardedGameIds: number[];
  setInventory: (inventory: Inventory) => void;
  setWallet: (wallet: Wallet) => void;
  wallet: Readonly<Ref<Wallet>>;
}
