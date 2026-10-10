import type { InventoryItem } from "#src/models/inventory/InventoryItem";
import type { ItemCount } from "#src/models/inventory/ItemCount";

// The materials destroying the entries returns, summed by material: each entry's return material, times its count
export const getDestroyReturns = (destroyedItems: InventoryItem[]): ItemCount[] => {
  const countMap = new Map<number, number>();
  for (const {
    definition: { destroyReturnMaterial = 0, destroyReturnMaterialCount = 0 },
  } of destroyedItems)
    countMap.set(destroyReturnMaterial, (countMap.get(destroyReturnMaterial) ?? 0) + destroyReturnMaterialCount);
  return Array.from(countMap, ([id, count]) => ({ count, id }));
};
