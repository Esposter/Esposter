import type { DevSaveOutcome } from "#src/models/dev/DevSaveOutcome";
import type { DevSaveTables } from "#src/models/dev/DevSaveTables";
import type { GenshinSave } from "#src/models/save/GenshinSave";

import { computeAdventureExpAtRank } from "#src/services/adventureRank/computeAdventureExpAtRank";
import { MAX_ADVENTURE_RANK } from "#src/services/adventureRank/constants";
import { z } from "zod";

// The `ar` line: the adventure rank to set the player to, from the first to the highest
export const setAdventureRankArgumentsSchema = z.object({
  rank: z.coerce.number().int().min(1).max(MAX_ADVENTURE_RANK),
});

export type SetAdventureRankArguments = z.infer<typeof setAdventureRankArgumentsSchema>;

// Sets the Adventure EXP that rank is reached at, read from the same rank table the game's rank rule reads, so the rank
// the game shows is the one named unless a main quest holds it lower
export const setAdventureRank = (
  save: GenshinSave,
  { rank }: SetAdventureRankArguments,
  tables: Pick<DevSaveTables, "adventureRankLevels">,
): DevSaveOutcome => ({
  ok: true,
  save: { ...save, adventureExp: computeAdventureExpAtRank(tables.adventureRankLevels, rank) },
  value: rank,
});
