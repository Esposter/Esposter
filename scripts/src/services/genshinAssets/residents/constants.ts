import { WORLD_DATA_DIRECTORY } from "#src/services/genshinAssets/shared/constants";
import { join } from "node:path";

// The region data files the residents are written into, one per region, beside its landmarks and camps
export const REGION_DATA_DIRECTORY: string = join(WORLD_DATA_DIRECTORY, "regions");
// The residents who duel the player, each by its resident id and the game of the card game's table it duels with. A seat
// Is placed only on a challenger NPC the regions the world builds hold: the game's NPC is read from the week and
// Character levels, and none of the challengers with a built deck stands in a built region yet, so the map is empty
export const RESIDENT_DUEL_GAME_ID_MAP: ReadonlyMap<string, number> = new Map<string, number>();
// The Reputation keepers, each by the building point the scene names its service with, and the NPC who keeps it. A keeper
// Has no birth in the scene, so her place is her service's point, an estimate the residents carry as provisional: Mondstadt's
// Hertha, NPC 1663, keeps the point named Reputation
export const REPUTATION_KEEPER_NPC_ID_MAP: ReadonlyMap<string, number> = new Map<string, number>([
  ["Reputation", 1663],
]);
