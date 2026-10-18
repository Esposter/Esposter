import type { ItemDefinition } from "#src/models/inventory/ItemDefinition";
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { ReliquaryPieceEntry } from "#src/models/reliquary/ReliquaryPieceEntry";
import type { WeaponData } from "#src/models/weapon/WeaponData";

import { getItemDefinition } from "#src/services/inventory/getItemDefinition";
import { getItemName } from "#src/services/inventory/getItemName";
import { toArtifactItemDefinition } from "#src/services/inventory/toArtifactItemDefinition";
import { toWeaponDefinition } from "#src/services/inventory/toWeaponDefinition";

// A dropped item's definition, told apart by the table its id is in: a weapon's from the weapon table, an artifact piece's
// From the reliquary tables, which hold it apart from the materials, and any other item's from the materials table
export const getDroppedItemDefinition = (
  itemId: number,
  names: Readonly<Record<string, string>>,
  weaponDataMap: ReadonlyMap<number, WeaponData>,
  materialDataMap: ReadonlyMap<number, MaterialData>,
  reliquaryPieceEntryMap: ReadonlyMap<number, ReliquaryPieceEntry>,
): ItemDefinition => {
  const weaponData = weaponDataMap.get(itemId);
  if (weaponData) return toWeaponDefinition(weaponData, getItemName(weaponData.nameTextId, names));
  const piece = reliquaryPieceEntryMap.get(itemId);
  return piece === undefined
    ? getItemDefinition(itemId, names, materialDataMap)
    : toArtifactItemDefinition(piece, names);
};
