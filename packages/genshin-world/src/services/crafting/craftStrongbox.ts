import type { ArtifactDropTables } from "#src/models/chest/ArtifactDropTables";
import type { CraftingStrongbox } from "#src/models/crafting/CraftingStrongbox";
import type { DroppedItemPickUp } from "#src/models/interaction/DroppedItemPickUp";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { ReliquaryPieceEntry } from "#src/models/reliquary/ReliquaryPieceEntry";
import type { WeaponData } from "#src/models/weapon/WeaponData";

import { canOfferForStrongbox } from "#src/services/crafting/canOfferForStrongbox";
import { rollStrongboxArtifact } from "#src/services/crafting/rollStrongboxArtifact";
import { pickUpDroppedItem } from "#src/services/interaction/pickUpDroppedItem";

// The game's tables and the names a strongbox's artifact is taken into the bag with, beside the roll's random
export interface StrongboxCraftTables {
  artifactDropTables: ArtifactDropTables;
  materialDataMap: ReadonlyMap<number, MaterialData>;
  names: Readonly<Record<string, string>>;
  random: () => number;
  reliquaryPieceEntryMap: ReadonlyMap<number, ReliquaryPieceEntry>;
  weaponDataMap: ReadonlyMap<number, WeaponData>;
}

// The bag and wallet after the Mystic Offering makes a strongbox: the chosen artifacts are given up, which must be exactly
// The strongbox's count of different unlocked artifacts of its star rank, and the artifact it holds is taken in as a drop.
// Undefined for any other choice, which gives up nothing
export const craftStrongbox = (
  inventory: Inventory,
  wallet: Wallet,
  strongbox: CraftingStrongbox,
  pickedIds: number[],
  tables: StrongboxCraftTables,
): DroppedItemPickUp | undefined => {
  const isCountRight = pickedIds.length === strongbox.needCount && new Set(pickedIds).size === pickedIds.length;
  const isOfferable = pickedIds.every((id) =>
    canOfferForStrongbox(
      inventory.items.find((item) => item.id === id),
      strongbox.rarity,
    ),
  );
  if (!isCountRight || !isOfferable) return undefined;
  const { artifactDropTables, materialDataMap, names, random, reliquaryPieceEntryMap, weaponDataMap } = tables;
  const remaining: Inventory = {
    items: inventory.items.filter((item) => !pickedIds.includes(item.id)),
    nextId: inventory.nextId,
  };
  return pickUpDroppedItem(
    rollStrongboxArtifact(strongbox, random, artifactDropTables),
    remaining,
    wallet,
    names,
    materialDataMap,
    reliquaryPieceEntryMap,
    weaponDataMap,
  );
};
