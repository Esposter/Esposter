import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { readItemCategoryRoomMap } from "#src/services/inventory/readItemCategoryRoomMap";

// The tabs' rooms as the game's constant table gives them, read from the hosted game data for the suites that add to a
// Bag
export const itemRooms = await readItemCategoryRoomMap(GAME_DATA_LOCAL_BASE_URL);
