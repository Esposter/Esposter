import type { Inventory } from "#src/models/inventory/Inventory";

import { MASTERLESS_STELLA_FORTUNA_ID } from "#src/services/character/constants";
import { checkIsItemCountsHeld } from "#src/services/inventory/checkIsItemCountsHeld";

// Whether the bag holds the Masterless Stella Fortuna a level lift costs, the one reading both the Attributes tab's
// Button and the lift itself take
export const checkIsLiftHeld = (inventory: Inventory, lift: { count: number }): boolean =>
  checkIsItemCountsHeld(inventory.items, [{ count: lift.count, id: MASTERLESS_STELLA_FORTUNA_ID }], 1);
