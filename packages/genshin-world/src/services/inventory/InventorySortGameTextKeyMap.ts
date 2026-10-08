import { InventorySort } from "genshin-interface";
import { GameTextKey } from "genshin-text";

// Each of the sort's choices by the game's own name for it
export const InventorySortGameTextKeyMap = {
  [InventorySort.Level]: GameTextKey.SortLevel,
  [InventorySort.Quality]: GameTextKey.SortQuality,
} as const satisfies Record<InventorySort, GameTextKey>;
