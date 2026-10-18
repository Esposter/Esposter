import type { InventoryItem } from "#src/models/inventory/InventoryItem";

import { canOfferForStrongbox } from "#src/services/crafting/canOfferForStrongbox";

// The bag entries the Mystic Offering lists for a strongbox of this star rank, in the bag's order: only the artifacts it
// Can be given, so a locked artifact and any entry that is no artifact are left out
export const getStrongboxCandidates = (items: readonly InventoryItem[], rarity: number): InventoryItem[] =>
  items.filter((item) => canOfferForStrongbox(item, rarity));
