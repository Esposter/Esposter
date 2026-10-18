import type { ExcelGcgGameRow } from "#src/models/genshinAssets/gcg/ExcelGcgGameRow";
import type { ExcelGcgWeekLevelRow } from "#src/models/genshinAssets/gcg/ExcelGcgWeekLevelRow";
import type { ExcelGcgWorldLevelRow } from "#src/models/genshinAssets/gcg/ExcelGcgWorldLevelRow";
import type { GcgGame } from "genshin-world";

import { GCG_DUEL_GAME_IDS, GcgDeckIdCreatedCardIdsMap } from "#src/services/genshinAssets/gcg/constants";
import { toGcgGames } from "#src/services/genshinAssets/gcg/toGcgGames";
import {
  RESIDENT_WEEK_GAME_NPC_IDS,
  RESIDENT_WORLD_LEVEL_DUEL_NPC_IDS,
} from "#src/services/genshinAssets/residents/constants";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { GameDataset } from "genshin-world";

// The duels and week games the world's residents play, read from the dump's game table into one small map by game id,
// which the world imports with its rule. Each names the deck its opponent plays and the player's, so a game is set up
// by its id alone. The duel ids are the levels of the listed duelists' world-level rows, and the week ids the levels of
// the listed week-game residents' week rows, the same residents the writer seats
export const buildGcgGames = (): Record<string, Record<string, GcgGame>> => {
  const worldLevelGameIds = readExcelTable<ExcelGcgWorldLevelRow>("GCGWorldLevelExcelConfigData")
    .filter(({ npcId }) => RESIDENT_WORLD_LEVEL_DUEL_NPC_IDS.includes(npcId))
    .map(({ levelId }) => levelId);
  const weekGameIds = readExcelTable<ExcelGcgWeekLevelRow>("GCGWeekLevelExcelConfigData")
    .filter(({ npcId }) => RESIDENT_WEEK_GAME_NPC_IDS.includes(npcId))
    .flatMap(({ levelCondList }) => levelCondList.map(({ levelId }) => levelId));
  const games = toGcgGames(
    readExcelTable<ExcelGcgGameRow>("GCGGameExcelConfigData"),
    [...GCG_DUEL_GAME_IDS, ...worldLevelGameIds, ...weekGameIds],
    [...GcgDeckIdCreatedCardIdsMap.keys()],
  );
  return { [`${GameDataset.Gcg}/games`]: games };
};
