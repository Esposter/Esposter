import type { Inventory } from "#src/models/inventory/Inventory";
import type { InventorySave } from "#src/models/inventory/InventorySave";
import type { ItemDefinition } from "#src/models/inventory/ItemDefinition";
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { ReliquaryPieceEntry } from "#src/models/reliquary/ReliquaryPieceEntry";
import type { WeaponData } from "#src/models/weapon/WeaponData";

import { getDroppedItemDefinition } from "#src/services/inventory/getDroppedItemDefinition";
import { getItemName } from "#src/services/inventory/getItemName";
import { toWeaponDefinition } from "#src/services/inventory/toWeaponDefinition";

// An entry's definition: a weapon's from the weapon table, which the bag holds a weapon as, an artifact's from the reliquary
// Tables, and any other item's from the materials table. The item's id is the only thing the save holds, so an entry is
// Told apart by the table its id is in
const toEntryDefinition = (
  itemId: number,
  names: Readonly<Record<string, string>>,
  weaponDataMap: ReadonlyMap<number, WeaponData>,
  materialDataMap: ReadonlyMap<number, MaterialData>,
  reliquaryPieceEntryMap: ReadonlyMap<number, ReliquaryPieceEntry>,
): ItemDefinition => {
  const weaponData = weaponDataMap.get(itemId);
  if (!weaponData) return getDroppedItemDefinition(itemId, names, materialDataMap, reliquaryPieceEntryMap);
  return toWeaponDefinition(weaponData, getItemName(weaponData.nameTextId, names));
};

// The bag read from its save, each entry's definition read by the item's id from the game's tables, which name it in the
// Reader's language. The save never holds a name, so a bag loads in whatever language it is read in
export const toInventory = (
  { items, ...inventory }: InventorySave,
  names: Readonly<Record<string, string>>,
  weaponDataMap: ReadonlyMap<number, WeaponData>,
  materialDataMap: ReadonlyMap<number, MaterialData>,
  reliquaryPieceEntryMap: ReadonlyMap<number, ReliquaryPieceEntry>,
): Inventory => ({
  ...inventory,
  items: items.map(({ itemId, kind: _kind, ...entry }) => ({
    ...entry,
    definition: toEntryDefinition(itemId, names, weaponDataMap, materialDataMap, reliquaryPieceEntryMap),
  })),
});
