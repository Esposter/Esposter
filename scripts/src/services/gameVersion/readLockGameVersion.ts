import { GAME_DATA_LOCK_PATH } from "#src/services/gameData/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { readFile } from "node:fs/promises";
import { z } from "zod";

// The game version the hosted game data lock records, empty when it records none
export const readLockGameVersion = async (lockPath: string = GAME_DATA_LOCK_PATH): Promise<string> => {
  const text = await readFile(lockPath, "utf8");
  const lock = z.object({ gameVersion: z.string().optional() }).parse(parseMachineJson(text));
  return lock.gameVersion || "";
};
