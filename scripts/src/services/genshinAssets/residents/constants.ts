import type { ResidentSpot } from "genshin-world";

import { WORLD_DATA_DIRECTORY } from "#src/services/genshinAssets/shared/constants";
import { join } from "node:path";

// The region data files the residents are written into, one per region, beside its landmarks and camps
export const REGION_DATA_DIRECTORY: string = join(WORLD_DATA_DIRECTORY, "regions");
// The residents who duel the player from the talk they begin, each by its resident id and the game of the card game's table
// It duels with: Ellin (9704) and Kimiya (9715), whose games are rows of their week tables. Ellin stands at the Knights of
// Favonius headquarters' point, and Kimiya beside Sumeru's crafting bench, each as an estimate the residents carry as
// Provisional. Marjorie (1435) duels from her world-level row, which the world table seats. Furuya Noboru, Patton and
// Kurisu have no point the scene names, so they are not seated: their wiki locations name a city or a tavern's outside,
// Not a place the scene holds
export const RESIDENT_DUEL_GAME_ID_MAP: ReadonlyMap<string, number> = new Map<string, number>([
  ["9704", 1031],
  ["9715", 1104],
]);
// The residents whose week table offers them a weekly guest challenge, by NPC id: the writer seats their week games and the
// Games builder publishes them, both read from the week table's rows for these NPCs
export const RESIDENT_WEEK_GAME_NPC_IDS: number[] = [9704, 9706, 9715];
// The residents whose world-level row offers them a duel, by NPC id: the writer seats their duels and the games builder
// Publishes them, both read from the world-level table's rows for these NPCs
export const RESIDENT_WORLD_LEVEL_DUEL_NPC_IDS: number[] = [1423, 1435, 2304, 2308];
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
// Guild's NPC is the base Katheryne, 1512, which the NPC table gives the lowest id, not confirmed against the scene. The
// Knights of Favonius headquarters, 54, is Ellin's point, the wiki placing her behind it, which no point gives
export const BUILDING_NPC_ID_MAP: ReadonlyMap<string, number> = new Map<string, number>([
  ["54", 9704],
  ["63", 1423],
  ["64", 1435],
  ["65", 1638],
  ["98", 1512],
  ["391", 1673],
  ["511", 1465],
  ["62", 1419],
]);
// The scene's crafting benches that an NPC stands beside, each by the bench's building point and the NPC who stands beside
// It: Sumeru's bench, 526, is Kimiya's, the wiki placing him next to the bench on Treasures Street in Sumeru City
export const CRAFTING_BENCH_NPC_ID_MAP: ReadonlyMap<string, number> = new Map<string, number>([["526", 9715]]);
