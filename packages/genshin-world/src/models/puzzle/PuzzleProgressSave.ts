import { MAX_SAVE_ID_LENGTH, MAX_SETTLED_SEELIE_COUNT, MAX_SOLVED_PUZZLE_COUNT } from "#src/services/save/constants";
import { createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

// The Seelies settled in their courts and the puzzles solved, each by its id, both unique
export const puzzleProgressSaveSchema = z.object({
  settledSeelieIds: createUniqueArraySchema(z.string().min(1).max(MAX_SAVE_ID_LENGTH)).max(MAX_SETTLED_SEELIE_COUNT),
  solvedPuzzleIds: createUniqueArraySchema(z.string().min(1).max(MAX_SAVE_ID_LENGTH)).max(MAX_SOLVED_PUZZLE_COUNT),
});
