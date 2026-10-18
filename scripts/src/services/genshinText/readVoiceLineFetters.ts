import type { FetterEntry } from "#src/models/genshinText/FetterEntry";

import { FETTERS_TABLE_NAME, VOICE_LINE_FETTER_TYPE } from "#src/services/genshinText/constants";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";

// Every character's voice-over lines in the order their profile lists them, by the character's id
export const readVoiceLineFetters = (): Map<number, FetterEntry[]> => {
  const fetters = readExcelTable<FetterEntry>(FETTERS_TABLE_NAME);
  return Map.groupBy(
    fetters.filter(({ type }) => type === VOICE_LINE_FETTER_TYPE),
    ({ avatarId }) => avatarId,
  );
};
