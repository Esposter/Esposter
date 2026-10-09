import type { GcgGame } from "#src/models/gcg/GcgGame";

import gamesJson from "#src/generated/gcg/games.json";
import { gcgGameSchema } from "#src/models/gcg/GcgGame";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { z } from "zod";

// The games written beside the standard rule, by their game id in the card game's table
const gcgGamesSchema = z.record(z.string(), gcgGameSchema);

// The duel a game of the card game's own table names: the decks its two sides play, as the games slice writes them
export const readGcgGame = (gameId: number): GcgGame => {
  const game = gcgGamesSchema.parse(gamesJson)[String(gameId)];
  if (!game) throw new InvalidOperationError(Operation.Read, "game", `no game ${gameId} is written`);
  return game;
};
