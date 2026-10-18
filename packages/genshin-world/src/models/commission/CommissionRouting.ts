import type { Character } from "#src/models/character/Character";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { Wallet } from "#src/models/inventory/Wallet";

// What a commission claim's rewards leave where they are kept: the Adventure EXP the rank holds, the characters with the
// Companionship EXP granted to the deployed team, the bag with its items taken in, and the wallet with its Mora
export interface CommissionRouting {
  adventureExp: number;
  characters: Character[];
  inventory: Inventory;
  wallet: Wallet;
}
