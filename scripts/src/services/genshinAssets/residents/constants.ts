import { WORLD_DATA_DIRECTORY } from "#src/services/genshinAssets/shared/constants";
import { join } from "node:path";

// The region data files the residents are written into, one per region, beside its landmarks and camps
export const REGION_DATA_DIRECTORY: string = join(WORLD_DATA_DIRECTORY, "regions");
// The residents who duel the player, each by its resident id and the game of the card game's table it duels with. A seat
// Is placed only on a challenger NPC the regions the world builds hold: the game's NPC is read from the week and
// Character levels, and none of the challengers with a built deck stands in a built region yet, so the map is empty
export const RESIDENT_DUEL_GAME_ID_MAP: ReadonlyMap<string, number> = new Map<string, number>();
