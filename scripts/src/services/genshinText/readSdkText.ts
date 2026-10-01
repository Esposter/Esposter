import type { GameLanguage } from "genshin-text";

import { GameLanguageSdkFileMap, SDK_LANGUAGE_DIRECTORY } from "#src/services/genshinText/constants";
import { exportSdkText } from "#src/services/genshinText/exportSdkText";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

// One language's account kit strings, key to string, exported from the installed game the first time they are read
export const readSdkText = (language: GameLanguage): Map<string, string> => {
  if (!existsSync(SDK_LANGUAGE_DIRECTORY)) exportSdkText();
  const entries = parseMachineJson<Record<string, unknown>>(
    readFileSync(join(SDK_LANGUAGE_DIRECTORY, `${GameLanguageSdkFileMap[language]}.json`), "utf8"),
  );
  return new Map(Object.entries(entries).filter((entry): entry is [string, string] => typeof entry[1] === "string"));
};
