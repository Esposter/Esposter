import type { InventoryItem } from "#src/models/inventory/InventoryItem";

// Whether a bag entry can be given up for a strongbox: an artifact of the strongbox's star rank that is not locked. An entry
// That is no artifact, or is not in the bag at all, cannot
export const canOfferForStrongbox = (item: InventoryItem | undefined, rarity: number): boolean =>
  item?.artifact !== undefined && item.artifact.rarity === rarity && !item.artifact.isLocked;
