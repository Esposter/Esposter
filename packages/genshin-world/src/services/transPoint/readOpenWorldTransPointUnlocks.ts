import type { TransPointUnlock } from "#src/models/transPoint/TransPointUnlock";

import { transPointUnlockSchema } from "#src/models/transPoint/TransPointUnlock";
import { readGameData } from "#src/services/data/readGameData";
import { z } from "zod";

// The open world's transport point unlocks, the slice `pnpm -C scripts genshin:assets trans-points` writes, fetched by its
// Key from the hosted game data and checked against its shape as it arrives
export const readOpenWorldTransPointUnlocks = (gameDataBaseUrl: string): Promise<TransPointUnlock[]> =>
  readGameData(gameDataBaseUrl, "transPoints/unlock", z.array(transPointUnlockSchema));
