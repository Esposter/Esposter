import type { AbyssCarryMember } from "#src/models/spiralAbyss/AbyssCarryMember";
import type { AbyssProgress } from "#src/models/spiralAbyss/AbyssProgress";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { Wallet } from "#src/models/inventory/Wallet";

// A clear settled: the cycle's progress after it, the party's carry into the next chamber, and the bag and wallet its
// Rewards paid into
export interface AbyssClearSettlement {
  carry: AbyssCarryMember[];
  inventory: Inventory;
  progress: AbyssProgress;
  wallet: Wallet;
}
