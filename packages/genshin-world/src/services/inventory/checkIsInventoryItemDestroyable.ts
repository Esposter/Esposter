import type { InventoryItem } from "#src/models/inventory/InventoryItem";

import { DESTROY_RARITY_LIMIT, EQUIPMENT_CATEGORIES } from "#src/services/inventory/constants";

// Whether the bag may destroy an entry: a weapon or an artifact of up to four stars. Materials, food and the rest are
// Never destroyed
export const checkIsInventoryItemDestroyable = ({ definition }: InventoryItem): boolean =>
  EQUIPMENT_CATEGORIES.includes(definition.category) && definition.rarity <= DESTROY_RARITY_LIMIT;
