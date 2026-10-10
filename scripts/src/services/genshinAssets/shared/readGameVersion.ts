import { GAME_EXECUTABLE_PATH } from "#src/services/genshinParity/shared/constants";
import { checkIsNotFound } from "#src/services/shared/checkIsNotFound";
import { getResultAsync, InvalidOperationError, Operation } from "@esposter/shared";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";

const CONFIG_FILE_NAME = "config.ini";

// The installed game's version, as its own config keeps it beside the executable
export const readGameVersion = async (): Promise<string> => {
  const configPath = join(dirname(GAME_EXECUTABLE_PATH), CONFIG_FILE_NAME);
  const configText = await getResultAsync(() => readFile(configPath, "utf8")).match(
    (text) => text,
    (error) => {
      if (!checkIsNotFound(error)) throw error;
      throw new InvalidOperationError(
        Operation.Read,
        CONFIG_FILE_NAME,
        "is missing: the install root needs config.ini with game_version=<version>, as the launcher writes it, and a hand-copied install must carry it beside GenshinImpact_Data",
      );
    },
  );
  const version = /^game_version=(?<version>.+)$/mu.exec(configText)?.groups?.version;
  if (!version) throw new InvalidOperationError(Operation.Read, CONFIG_FILE_NAME, "has no game_version");
  return version.trim();
};
