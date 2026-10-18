import type { Inventory } from "#src/models/inventory/Inventory";
import type { Wallet } from "#src/models/inventory/Wallet";

// The parts of the save a card game's reward pays into: the card game's EXP, the bag and wallet, and the games whose
// One-time reward is paid already
export interface GcgRewardState {
  cardGameExp: number;
  inventory: Inventory;
  rewardedGameIds: number[];
  wallet: Wallet;
}
