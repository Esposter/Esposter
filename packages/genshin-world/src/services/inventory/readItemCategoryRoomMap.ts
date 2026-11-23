import type { ItemCategoryRoomMap } from "#src/models/inventory/ItemCategoryRoomMap";

import { itemCategoryRoomMapSchema } from "#src/models/inventory/ItemCategoryRoomMap";
import { readGameData } from "#src/services/data/readGameData";

// The tabs' rooms as the game's constant table gives them, read by their key from the hosted game data
export const readItemCategoryRoomMap = (gameDataBaseUrl: string): Promise<ItemCategoryRoomMap> =>
  readGameData(gameDataBaseUrl, "stats/itemRooms", itemCategoryRoomMapSchema);
