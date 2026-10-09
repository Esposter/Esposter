import type { Inventory } from "#src/models/inventory/Inventory";
import type { InventorySave } from "#src/models/inventory/InventorySave";
import type { ItemDefinition } from "#src/models/inventory/ItemDefinition";
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { WeaponData } from "#src/models/weapon/WeaponData";

import { getItemDefinition } from "#src/services/inventory/getItemDefinition";
import { getItemName } from "#src/services/inventory/getItemName";
import { toWeaponDefinition } from "#src/services/inventory/toWeaponDefinition";

// An entry's definition: a weapon's from the weapon table, which the bag holds a weapon as, and any other item's from the
// Materials table. The item's id is the only thing the save holds, so a weapon is told from a material by the table it is in
const toEntryDefinition = (
  itemId: number,
  names: Readonly<Record<string, string>>,
  weaponDataMap: ReadonlyMap<number, WeaponData>,
  materialDataMap: ReadonlyMap<number, MaterialData>,
): ItemDefinition => {
  const weaponData = weaponDataMap.get(itemId);
  if (!weaponData) return getItemDefinition(itemId, names, materialDataMap);
  return toWeaponDefinition(weaponData, getItemName(weaponData.nameTextId, names));
};

// The bag read from its save, each entry's definition read by the item's id from the game's tables, which name it in the
// Reader's language. The save never holds a name, so a bag loads in whatever language it is read in
export const toInventory = (
  { items, nextId }: InventorySave,
  names: Readonly<Record<string, string>>,
  weaponDataMap: ReadonlyMap<number, WeaponData>,
  materialDataMap: ReadonlyMap<number, MaterialData>,
): Inventory => ({
  items: items.map(({ itemId, ...entry }) => ({
    ...entry,
    definition: toEntryDefinition(itemId, names, weaponDataMap, materialDataMap),
  })),
  nextId,
});
