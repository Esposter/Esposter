import type { ExcelLocalizationRow } from "#src/models/genshinAssets/archive/ExcelLocalizationRow";
import type { GameLanguage } from "genshin-text";

import {
  BOOK_BODY_GENERATED_DIRECTORY,
  BOOK_BODY_LOADER_MAP_PATH,
  LOCALIZATION_TABLE_NAME,
} from "#src/services/genshinAssets/archive/constants";
import { LocalizationPathKeyMap } from "#src/services/genshinAssets/archive/LocalizationPathKeyMap";
import { readExcelTable } from "#src/services/genshinAssets/stats/readExcelTable";
import { GameLanguageCodeMap, READABLE_DIRECTORY } from "#src/services/genshinText/constants";
import { getPlainGameText } from "#src/services/genshinText/getPlainGameText";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { GameLanguages } from "genshin-text";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";

// Every language's text of each book's body, read from the readable file its localization row names in that language, and
// Written as one chunk a body, holding every language, beside a loader map that imports each chunk on demand. Returns a
// Note of the count
export const writeBookBodies = (bodyIds: readonly number[]): string[] => {
  const localizationRowMap = new Map(
    readExcelTable<ExcelLocalizationRow>(LOCALIZATION_TABLE_NAME).map((localizationRow) => [
      localizationRow.id,
      localizationRow,
    ]),
  );
  const sortedBodyIds = [...new Set(bodyIds)].toSorted((firstId, secondId) => firstId - secondId);
  rmSync(BOOK_BODY_GENERATED_DIRECTORY, { force: true, recursive: true });
  mkdirSync(BOOK_BODY_GENERATED_DIRECTORY, { recursive: true });
  const loaderLines = sortedBodyIds.map((bodyId) => {
    const localizationRow = localizationRowMap.get(bodyId);
    if (!localizationRow)
      throw new InvalidOperationError(Operation.Read, String(bodyId), "has no row in the localization table");
    const body = Object.fromEntries(
      GameLanguages.map((language) => [language, readBookBody(localizationRow, language)]),
    );
    writeFileSync(join(BOOK_BODY_GENERATED_DIRECTORY, `${bodyId}.json`), JSON.stringify(body));
    return `  [${bodyId}, async () => (await import("#src/generated/bookBody/${bodyId}.json")).default],`;
  });
  writeFileSync(
    BOOK_BODY_LOADER_MAP_PATH,
    `import type { GameLanguage } from "genshin-text";

// The loader of each book's body chunk by the id of its localization text, as \`genshin:assets archive\` writes them. A
// Chunk holds every language's text of its body, and is imported on demand
export const BookBodyLoaderMap: ReadonlyMap<number, () => Promise<Readonly<Record<GameLanguage, string>>>> = new Map([
${loaderLines.join("\n")}
]);
`,
  );
  return [`${sortedBodyIds.length} book bodies written in ${GameLanguages.length} languages`];
};

// A book's body in one language, from the readable file its localization row names there, as the game shows it on a PC
const readBookBody = (localizationRow: ExcelLocalizationRow, language: GameLanguage): string => {
  const fileName = basename(localizationRow[LocalizationPathKeyMap[language]]);
  const text = readFileSync(join(READABLE_DIRECTORY, GameLanguageCodeMap[language], `${fileName}.txt`), "utf8");
  return getPlainGameText(text).trim();
};
