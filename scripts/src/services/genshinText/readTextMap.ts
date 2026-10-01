import type { GameLanguage } from "genshin-text";

import { GameLanguageCodeMap, TEXT_MAP_DIRECTORY } from "#src/services/genshinText/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

// One language's whole text map, hash to string: the main map and the medium one, each in as many numbered parts as
// The dump splits it into
export const readTextMap = (language: GameLanguage): Map<string, string> => {
  const fileRegex = new RegExp(String.raw`^TextMap(?:_Medium)?${GameLanguageCodeMap[language]}(?:_\d+)?\.json$`, "u");
  const fileNames = readdirSync(TEXT_MAP_DIRECTORY).filter((fileName) => fileRegex.test(fileName));
  const textMap = new Map<string, string>();
  for (const fileName of fileNames) {
    const entries = parseMachineJson<Record<string, string>>(readFileSync(join(TEXT_MAP_DIRECTORY, fileName), "utf8"));
    for (const [hash, text] of Object.entries(entries)) textMap.set(hash, text);
  }

  return textMap;
};
