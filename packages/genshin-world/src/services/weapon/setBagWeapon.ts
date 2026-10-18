import type { InventoryItem } from "#src/models/inventory/InventoryItem";
import type { Weapon } from "#src/models/weapon/Weapon";

// The bag's entries with the one of the given id holding the weapon's state, as a levelling, ascension or refinement left
// It. The other entries are kept as they were
export const setBagWeapon = (
  items: InventoryItem[],
  entryId: number,
  { ascension, experience, level, refinement }: Weapon,
): InventoryItem[] =>
  items.map((item) => (item.id === entryId ? { ...item, ascension, experience, level, refinement } : item));
