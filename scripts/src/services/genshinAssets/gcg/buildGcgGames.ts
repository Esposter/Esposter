import type { ExcelGcgGameRow } from "#src/models/genshinAssets/gcg/ExcelGcgGameRow";
import type { GcgGame } from "genshin-world";

import {
  GCG_CHALLENGER_WEEK_GAME_IDS,
  GCG_DUEL_GAME_IDS,
  GcgDeckIdCreatedCardIdsMap,
} from "#src/services/genshinAssets/gcg/constants";
import { toGcgGames } from "#src/services/genshinAssets/gcg/toGcgGames";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { GameDataset } from "genshin-world";

// The duels the world's residents play and the challengers' duels beside them, read from the dump's game table into one
// Small map by game id, which the world imports with its rule. Each names the deck its opponent plays and the player's,
// So a duel is set up by its game id alone
export const buildGcgGames = (): Record<string, Record<string, GcgGame>> => {
  const games = toGcgGames(
    readExcelTable<ExcelGcgGameRow>("GCGGameExcelConfigData"),
    [...GCG_DUEL_GAME_IDS, ...GCG_CHALLENGER_WEEK_GAME_IDS],
    [...GcgDeckIdCreatedCardIdsMap.keys()],
  );
  return { [`${GameDataset.Gcg}/games`]: games };
};
