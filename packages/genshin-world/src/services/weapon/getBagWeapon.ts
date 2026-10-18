import type { InventoryItem } from "#src/models/inventory/InventoryItem";
import type { Weapon } from "#src/models/weapon/Weapon";

import { InvalidOperationError, Operation } from "@esposter/shared";

// The weapon a bag entry holds, with the state its entry carries. Only a weapon's entry holds that state, so an entry that
// Lacks it, or that the bag does not hold, is refused
export const getBagWeapon = (items: InventoryItem[], entryId: number): Weapon => {
  const item = items.find((entry) => entry.id === entryId);
  if (
    item?.ascension === undefined ||
    item.experience === undefined ||
    item.level === undefined ||
    item.refinement === undefined
  )
    throw new InvalidOperationError(Operation.Read, getBagWeapon.name, `weapon ${entryId} without its state`);
  return {
    ascension: item.ascension,
    experience: item.experience,
    id: item.definition.id,
    level: item.level,
    refinement: item.refinement,
  };
};
