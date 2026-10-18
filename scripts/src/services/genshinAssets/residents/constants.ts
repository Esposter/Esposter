import type { ResidentSpot } from "genshin-world";

import { WORLD_DATA_DIRECTORY } from "#src/services/genshinAssets/shared/constants";
import { join } from "node:path";

// The region data files the residents are written into, one per region, beside its landmarks and camps
export const REGION_DATA_DIRECTORY: string = join(WORLD_DATA_DIRECTORY, "regions");
// The residents who duel the player, each by its resident id and the game of the card game's table it duels with. A seat
// Is placed only on a challenger NPC the regions the world builds hold: the game's NPC is read from the week and
// Character levels, and none of the challengers with a built deck stands in a built region yet, so the map is empty
export const RESIDENT_DUEL_GAME_ID_MAP: ReadonlyMap<string, number> = new Map<string, number>();
// The night spots of the residents outside Nod-Krai, each by its NPC id. The map fills from the PC's NPC placements export,
// Which the wiki's NPC pages cannot stand in for: they give each NPC's location by name and no coordinates. Until that export
// Is read, the map is empty and no resident gains a night spot
export const RESIDENT_NIGHT_SPOT_MAP: ReadonlyMap<number, ResidentSpot> = new Map<number, ResidentSpot>();
// The Reputation keepers, each by the building point the scene names its service with, and the NPC who keeps it. A keeper
// Has no birth in the scene, so her place is her service's point, an estimate the residents carry as provisional: Mondstadt's
// Hertha, NPC 1663, keeps the point named Reputation
export const REPUTATION_KEEPER_NPC_ID_MAP: ReadonlyMap<string, number> = new Map<string, number>([
  ["Reputation", 1663],
]);
// The scene's building points that stand for the NPC who keeps them, each by the point's id: Mondstadt's General Goods,
// Souvenir and Blacksmith shops, the Adventurers' Guild, Good Hunter's restaurant, the Fishing Association and Angel's
// Share's bartender. A vendor
// Has no birth in the scene, so her place is her point, an estimate the residents carry as provisional. The Adventurers'
// Guild's NPC is the base Katheryne, 1512, which the NPC table gives the lowest id, not confirmed against the scene
export const BUILDING_NPC_ID_MAP: ReadonlyMap<string, number> = new Map<string, number>([
  ["63", 1423],
  ["64", 1435],
  ["65", 1638],
  ["98", 1512],
  ["391", 1673],
  ["511", 1465],
  ["62", 1419],
]);
