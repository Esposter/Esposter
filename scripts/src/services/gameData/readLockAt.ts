import type { GameDataLock } from "genshin-world";

import { GAME_DATA_LOCK_REPOSITORY_PATH } from "#src/services/gameData/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { runGit } from "#src/services/shared/runGit";
import { gameDataLockSchema } from "genshin-world";

// A lock that exists but does not parse throws, since skipping it would let a prune take what it names
export const readLockAt = (revision: string): GameDataLock =>
  gameDataLockSchema.parse(parseMachineJson(runGit(["show", `${revision}:${GAME_DATA_LOCK_REPOSITORY_PATH}`])));
