import type { AdventureRankTables } from "#src/models/adventureRank/AdventureRankTables";

import { adventureRankLevelSchema } from "#src/models/adventureRank/AdventureRankLevel";
import { adventureRankLockSchema } from "#src/models/adventureRank/AdventureRankLock";
import { worldLevelRowSchema } from "#src/models/adventureRank/WorldLevelRow";
import { readGameData } from "#src/services/data/readGameData";
import { z } from "zod";

// The game's rank table, lock table and world level table, as `pnpm -C scripts genshin:assets rank` builds them, each
// Fetched by its key from the hosted game data and checked against its schema as it arrives
export const readAdventureRankTables = async (gameDataBaseUrl: string): Promise<AdventureRankTables> => {
  const [levels, locks, worldLevelRows] = await Promise.all([
    readGameData(gameDataBaseUrl, "adventureRank/levels", z.array(adventureRankLevelSchema)),
    readGameData(gameDataBaseUrl, "adventureRank/locks", z.array(adventureRankLockSchema)),
    readGameData(gameDataBaseUrl, "adventureRank/worldLevels", z.array(worldLevelRowSchema)),
  ]);
  return { levels, locks, worldLevelRows };
};
