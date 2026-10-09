import { GAME_EXECUTABLE_PATH } from "#src/services/genshinParity/shared/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";

// The installed game's version, as its own config keeps it beside the executable
export const readGameVersion = async (): Promise<string> => {
  const configPath = join(dirname(GAME_EXECUTABLE_PATH), "config.ini");
  const version = /^game_version=(?<version>.+)$/mu.exec(await readFile(configPath, "utf8"))?.groups?.version;
  if (!version) throw new InvalidOperationError(Operation.Read, configPath, "has no game_version");
  return version.trim();
};
