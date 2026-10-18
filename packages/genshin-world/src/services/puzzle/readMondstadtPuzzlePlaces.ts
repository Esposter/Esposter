import type { PuzzlePlace } from "#src/models/puzzle/PuzzlePlace";

import { puzzlePlaceSchema } from "#src/models/puzzle/PuzzlePlace";
import { readGameData } from "#src/services/data/readGameData";
import { createUniqueArraySchema } from "@esposter/shared";

// Mondstadt's puzzle places as `genshin:assets puzzles` publishes them, fetched by their key from the hosted game data and
// Checked against their schema as they arrive, with each place's id unique
export const readMondstadtPuzzlePlaces = (gameDataBaseUrl: string): Promise<PuzzlePlace[]> =>
  readGameData(gameDataBaseUrl, "puzzles/mondstadt", createUniqueArraySchema(puzzlePlaceSchema, "id"));
