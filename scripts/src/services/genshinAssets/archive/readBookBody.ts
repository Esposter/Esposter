import type { ExcelLocalizationRow } from "#src/models/genshinAssets/archive/ExcelLocalizationRow";
import type { GameLanguage } from "genshin-text";

import { LocalizationPathKeyMap } from "#src/services/genshinAssets/archive/LocalizationPathKeyMap";
import { GameLanguageCodeMap, READABLE_DIRECTORY } from "#src/services/genshinText/constants";
import { getPlainGameText } from "#src/services/genshinText/getPlainGameText";
import { readFileSync } from "node:fs";
import { basename, join } from "node:path";

// A book's body in one language, from the readable file its localization row names there, as the game shows it on a PC.
// The file's lines end in a carriage return and a line feed, and a body keeps the line feed alone
export const readBookBody = (localizationRow: ExcelLocalizationRow, language: GameLanguage): string => {
  const fileName = basename(localizationRow[LocalizationPathKeyMap[language]]);
  const text = readFileSync(join(READABLE_DIRECTORY, GameLanguageCodeMap[language], `${fileName}.txt`), "utf8");
  return getPlainGameText(text.replaceAll("\r\n", "\n")).trim();
};
