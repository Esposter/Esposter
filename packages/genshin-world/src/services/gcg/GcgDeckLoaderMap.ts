import { readGameData } from "#src/services/data/readGameData";
import { z } from "zod";

// The loader of each opponent deck's slice by the deck's id in the game's table, as `genshin:assets gcg` writes them. A
// Slice is fetched by its key, so a deck's cards are read only once a duel is set up with it
export const GcgDeckLoaderMap: ReadonlyMap<number, (gameDataBaseUrl: string) => Promise<unknown>> = new Map([
  [1, (gameDataBaseUrl) => readGameData(gameDataBaseUrl, "gcg/deck1", z.unknown())],
  [2, (gameDataBaseUrl) => readGameData(gameDataBaseUrl, "gcg/deck2", z.unknown())],
  [3, (gameDataBaseUrl) => readGameData(gameDataBaseUrl, "gcg/deck3", z.unknown())],
  [4, (gameDataBaseUrl) => readGameData(gameDataBaseUrl, "gcg/deck4", z.unknown())],
  [7, (gameDataBaseUrl) => readGameData(gameDataBaseUrl, "gcg/deck7", z.unknown())],
  [11_002, (gameDataBaseUrl) => readGameData(gameDataBaseUrl, "gcg/deck11002", z.unknown())],
  [11_005, (gameDataBaseUrl) => readGameData(gameDataBaseUrl, "gcg/deck11005", z.unknown())],
  [30_111, (gameDataBaseUrl) => readGameData(gameDataBaseUrl, "gcg/deck30111", z.unknown())],
  [30_112, (gameDataBaseUrl) => readGameData(gameDataBaseUrl, "gcg/deck30112", z.unknown())],
]);
