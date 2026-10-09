import type { GcgGame } from "#src/models/gcg/GcgGame";

import { gcgGameSchema } from "#src/models/gcg/GcgGame";
import { readGameData } from "#src/services/data/readGameData";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { z } from "zod";

// The games written beside the standard rule, by their game id in the card game's table
const gcgGamesSchema = z.record(z.string(), gcgGameSchema);

// The duel a game of the card game's own table names: the decks its two sides play, as the games slice writes them
export const readGcgGame = async (gameDataBaseUrl: string, gameId: number): Promise<GcgGame> => {
  const games = await readGameData(gameDataBaseUrl, "gcg/games", gcgGamesSchema);
  const game = games[String(gameId)];
  if (!game) throw new InvalidOperationError(Operation.Read, "game", `no game ${gameId} is written`);
  return game;
};
