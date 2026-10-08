import type { Expedition } from "#src/models/expedition/Expedition";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { Wallet } from "#src/models/inventory/Wallet";

// The state after a returned expedition is claimed: the expeditions still out, the bag with the items taken in, and the
// Wallet with the Mora given
export interface ExpeditionClaim {
  expeditions: Expedition[];
  inventory: Inventory;
  wallet: Wallet;
}
