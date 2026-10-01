import type { FetterEntry } from "#src/models/genshinText/FetterEntry";

import { FETTERS_PATH, VOICE_LINE_FETTER_TYPE } from "#src/services/genshinText/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { readFileSync } from "node:fs";

// Every character's voice-over lines in the order their profile lists them, by the character's id
export const readVoiceLineFetters = (): Map<number, FetterEntry[]> => {
  const fetters = parseMachineJson<FetterEntry[]>(readFileSync(FETTERS_PATH, "utf8"));
  return Map.groupBy(
    fetters.filter(({ type }) => type === VOICE_LINE_FETTER_TYPE),
    ({ avatarId }) => avatarId,
  );
};
