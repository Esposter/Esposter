import type { ResidentSpot, ResidentWeekGame } from "genshin-world";

import { WORLD_DATA_DIRECTORY } from "#src/services/genshinAssets/shared/constants";
import { join } from "node:path";

// The region data files the residents are written into, one per region, beside its landmarks and camps
export const REGION_DATA_DIRECTORY: string = join(WORLD_DATA_DIRECTORY, "regions");
// The residents who duel the player, each by its resident id and the game of the card game's table it duels with. Marjorie
// Keeps her Souvenir shop, so her duel sits on her shop row, NPC 1435, whose talk the wiki's Adventure Challenge is in;
// Ellin (9704) stands at the Knights' headquarters point, and Kimiya (9715) beside Sumeru's crafting bench, each as an
// Estimate the residents carry as provisional. Furuya Noboru, Patton and Kurisu have no point the scene names, so they
// Are not seated: their wiki locations name a city or a tavern's outside, not a place the scene holds
export const RESIDENT_DUEL_GAME_ID_MAP: ReadonlyMap<string, number> = new Map<string, number>([
  ["1435", 1021],
  ["9704", 1031],
  ["9715", 1104],
]);
// The week games the residents offer in their weekly guest challenge, each at the seat of the NPC who offers it. Kimiya's week
// Row (110) names game 1103 at level 5 among the five games the row lists, and the Lucky Coins and Player EXP are the
// week's reward at that level, from the GCGWeekReward rows at level 5
export const RESIDENT_WEEK_GAME_MAP: ReadonlyMap<string, ResidentWeekGame> = new Map<string, ResidentWeekGame>([
  ["9715", { gameId: 1103, gcgLevel: 5, luckyCoins: 900, playerExp: 200 }],
]);
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
