import type { InventoryItem } from "#src/models/inventory/InventoryItem";

import { FRAGILE_RESIN_ITEM_ID } from "#src/services/originalResin/constants";

// Whether a bag entry is Fragile Resin, by its id, since the published material table does not yet carry the item
export const checkIsFragileResin = (item: InventoryItem): boolean => item.definition.id === FRAGILE_RESIN_ITEM_ID;
