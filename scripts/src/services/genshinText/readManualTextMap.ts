import type { ManualTextMapEntry } from "#src/models/genshinText/ManualTextMapEntry";

import { MANUAL_TEXT_MAP_TABLE_NAME } from "#src/services/genshinText/constants";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";

// The game's own names for its interface strings, each to the hash its text is filed under in every language
export const readManualTextMap = (): Map<string, string> => {
  const entries = readExcelTable<ManualTextMapEntry>(MANUAL_TEXT_MAP_TABLE_NAME);
  return new Map(
    entries.map(({ textMapContentTextMapHash, textMapId }) => [textMapId, String(textMapContentTextMapHash)]),
  );
};
