import type { InventoryItem } from "#src/models/inventory/InventoryItem";

import { DestroyRule } from "#src/models/inventory/DestroyRule";

// Whether the bag may destroy an entry: the game's own destroy rule on its definition returns materials. An entry the
// Rule is absent from is never destroyed
export const checkIsInventoryItemDestroyable = ({ definition }: InventoryItem): boolean =>
  definition.destroyRule === DestroyRule.ReturnMaterial;
