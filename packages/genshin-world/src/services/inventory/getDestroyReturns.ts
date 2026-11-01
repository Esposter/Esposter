import type { InventoryItem } from "#src/models/inventory/InventoryItem";
import type { ItemCount } from "#src/models/inventory/ItemCount";

// The materials destroying the entries returns, summed by material: each entry's return material, times its count. An
// Entry whose table names no return material returns none
export const getDestroyReturns = (destroyedItems: InventoryItem[]): ItemCount[] => {
  const countMap = new Map<number, number>();
  for (const {
    definition: { destroyReturnMaterial, destroyReturnMaterialCount = 0 },
  } of destroyedItems) {
    if (destroyReturnMaterial === undefined) continue;
    countMap.set(destroyReturnMaterial, (countMap.get(destroyReturnMaterial) ?? 0) + destroyReturnMaterialCount);
  }
  return Array.from(countMap, ([id, count]) => ({ count, id }));
};
