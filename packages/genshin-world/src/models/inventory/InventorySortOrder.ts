import type { InventorySort } from "genshin-interface";

// How the weapons' and artifacts' tabs are sorted: by what, and whether from the highest down
export interface InventorySortOrder {
  isDescending: boolean;
  sort: InventorySort;
}
