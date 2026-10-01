import type { ManualTextMapEntry } from "#src/models/genshinText/ManualTextMapEntry";

import { MANUAL_TEXT_MAP_PATH } from "#src/services/genshinText/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { readFileSync } from "node:fs";

// The game's own names for its interface strings, each to the hash its text is filed under in every language
export const readManualTextMap = (): Map<string, string> => {
  const entries = parseMachineJson<ManualTextMapEntry[]>(readFileSync(MANUAL_TEXT_MAP_PATH, "utf8"));
  return new Map(
    entries.map(({ textMapContentTextMapHash, textMapId }) => [textMapId, String(textMapContentTextMapHash)]),
  );
};
