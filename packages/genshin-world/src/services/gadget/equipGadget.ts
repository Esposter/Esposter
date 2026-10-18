import type { GadgetRow } from "#src/models/gadget/GadgetRow";
import type { Inventory } from "#src/models/inventory/Inventory";

// The bag with the gadget equipped to the quick-use slot. A gadget the game does not mark equipable is refused, and the
// Bag comes back as it was, the slot unchanged
export const equipGadget = (inventory: Inventory, gadget: GadgetRow): Inventory =>
  gadget.isEquipable ? { ...inventory, equippedGadgetItemId: gadget.id } : inventory;
