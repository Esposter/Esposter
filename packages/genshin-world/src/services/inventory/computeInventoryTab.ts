import type { InventoryItem } from "#src/models/inventory/InventoryItem";
import type { InventorySortOrder } from "#src/models/inventory/InventorySortOrder";

import { EQUIPMENT_CATEGORIES, QUALITY_SORTED_CATEGORIES } from "#src/services/inventory/constants";
import { InventorySort, ItemCategory } from "genshin-interface";

// A tab's entries in the order the game shows them. Weapons and artifacts sort by level or quality as chosen, the other
// Breaking a tie the same way; furnishings run from the first obtained, gadgets and quest items from the highest quality
// Down, and every other tab in the game's own order of its items. A tie left falls to that order, then to the order
// The entries were obtained in
export const computeInventoryTab = (
  items: InventoryItem[],
  category: ItemCategory,
  { isDescending, sort }: InventorySortOrder,
): InventoryItem[] => {
  const direction = isDescending ? -1 : 1;
  const getSortKeys = ({ definition: { rank, rarity }, id, level = 0 }: InventoryItem): number[] => {
    if (EQUIPMENT_CATEGORIES.includes(category)) {
      const [firstKey, secondKey] = sort === InventorySort.Level ? [level, rarity] : [rarity, level];
      return [direction * firstKey, direction * secondKey, rank, id];
    } else if (category === ItemCategory.Furnishing) return [id];
    else if (QUALITY_SORTED_CATEGORIES.includes(category)) return [-rarity, rank, id];
    else return [rank, id];
  };
  return items
    .filter((item) => item.definition.category === category)
    .map((item) => ({ item, sortKeys: getSortKeys(item) }))
    .toSorted((firstEntry, secondEntry) =>
      firstEntry.sortKeys.reduce((order, key, index) => order || key - (secondEntry.sortKeys[index] ?? 0), 0),
    )
    .map(({ item }) => item);
};
