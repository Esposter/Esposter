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

// Every language's text of each book's body, read from the readable file its localization row names in that language,
// And written as one chunk a body and a language beside a loader map that imports each chunk on demand, so a reader
// Downloads only its own language's text of the volume it opens. Returns a note of the count
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
    const bodyDirectory = join(BOOK_BODY_GENERATED_DIRECTORY, String(bodyId));
    mkdirSync(bodyDirectory, { recursive: true });
    const languageLines = GameLanguages.map((language) => {
      writeFileSync(join(bodyDirectory, `${language}.json`), JSON.stringify(readBookBody(localizationRow, language)));
      return `    ${language}: async () => (await import("#src/generated/bookBody/${bodyId}/${language}.json")).default,`;
    });
    return `  [${bodyId}, {\n${languageLines.join("\n")}\n  }],`;
  });
  writeFileSync(
    BOOK_BODY_LOADER_MAP_PATH,
    `import type { GameLanguage } from "genshin-text";

// The loader of each book's body's chunk by the id of its localization text and then its language, as
// \`genshin:assets archive\` writes them. A chunk holds one language's text of its body, and is imported on demand
export const BookBodyLoaderMap: ReadonlyMap<number, Readonly<Record<GameLanguage, () => Promise<string>>>> = new Map([
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
