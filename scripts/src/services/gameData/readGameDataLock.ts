import type { GameDataLock } from "genshin-world";

import { GAME_DATA_LOCK_PATH } from "#src/services/gameData/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { gameDataLockSchema } from "genshin-world";
import { readFile } from "node:fs/promises";

// Read from disk on every call, never from genshin-world's build, which a step running under tsx may load stale
export const readGameDataLock = async (lockPath: string = GAME_DATA_LOCK_PATH): Promise<GameDataLock> =>
  gameDataLockSchema.parse(parseMachineJson(await readFile(lockPath, "utf8")));
