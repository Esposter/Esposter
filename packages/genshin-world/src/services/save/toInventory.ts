import type { Inventory } from "#src/models/inventory/Inventory";
import type { InventorySave } from "#src/models/inventory/InventorySave";
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { ReliquaryPieceEntry } from "#src/models/reliquary/ReliquaryPieceEntry";
import type { WeaponData } from "#src/models/weapon/WeaponData";

import { getDroppedItemDefinition } from "#src/services/inventory/getDroppedItemDefinition";

// The bag read from its save, each entry's definition read by the item's id from the game's tables, which name it in the
// Reader's language. The save never holds a name, so a bag loads in whatever language it is read in, and an entry is told
// Apart by the table its id is in
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
    definition: getDroppedItemDefinition(itemId, names, weaponDataMap, materialDataMap, reliquaryPieceEntryMap),
  })),
});
