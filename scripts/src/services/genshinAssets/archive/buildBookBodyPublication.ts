import type { GameDataPublication } from "#src/models/gameData/GameDataPublication";
import type { ExcelLocalizationRow } from "#src/models/genshinAssets/archive/ExcelLocalizationRow";
import type { GameLanguage } from "genshin-text";

import { LOCALIZATION_TABLE_NAME } from "#src/services/genshinAssets/archive/constants";
import { LocalizationPathKeyMap } from "#src/services/genshinAssets/archive/LocalizationPathKeyMap";
import { readExcelTable } from "#src/services/genshinAssets/stats/readExcelTable";
import { GameLanguageCodeMap, READABLE_DIRECTORY } from "#src/services/genshinText/constants";
import { getPlainGameText } from "#src/services/genshinText/getPlainGameText";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { GameLanguages } from "genshin-text";
import { GameDataset } from "genshin-world";
import { readFileSync } from "node:fs";
import { basename, join } from "node:path";

// Every language's text of each book's body, read from the readable file its localization row names in that language, and
// Published as one index a language, each body keyed by its id. Returns the publication and a note of the count
export const buildBookBodyPublication = (
  bodyIds: readonly number[],
): { note: string; publication: GameDataPublication } => {
  const localizationRowMap = new Map(
    readExcelTable<ExcelLocalizationRow>(LOCALIZATION_TABLE_NAME).map((localizationRow) => [
      localizationRow.id,
      localizationRow,
    ]),
  );
  const sortedBodyIds = [...new Set(bodyIds)].toSorted((firstId, secondId) => firstId - secondId);
  const localizationRows = sortedBodyIds.map((bodyId) => {
    const localizationRow = localizationRowMap.get(bodyId);
    if (!localizationRow)
      throw new InvalidOperationError(Operation.Read, String(bodyId), "has no row in the localization table");
    return [bodyId, localizationRow] as const;
  });
  const indexes = Object.fromEntries(
    GameLanguages.map((language) => [
      `${GameDataset.BookBody}/${language}`,
      Object.fromEntries(
        localizationRows.map(([bodyId, localizationRow]) => [String(bodyId), readBookBody(localizationRow, language)]),
      ),
    ]),
  );
  return {
    note: `${sortedBodyIds.length} book bodies built in ${GameLanguages.length} languages`,
    publication: { indexes, objects: {} },
  };
};

// A book's body in one language, from the readable file its localization row names there, as the game shows it on a PC
const readBookBody = (localizationRow: ExcelLocalizationRow, language: GameLanguage): string => {
  const fileName = basename(localizationRow[LocalizationPathKeyMap[language]]);
  const text = readFileSync(join(READABLE_DIRECTORY, GameLanguageCodeMap[language], `${fileName}.txt`), "utf8");
  return getPlainGameText(text).trim();
};
