import type { ExcelLocalizationRow } from "#src/models/genshinAssets/archive/ExcelLocalizationRow";
import type { GameDataPublication } from "#src/models/shared/GameDataPublication";

import { LOCALIZATION_TABLE_NAME } from "#src/services/genshinAssets/archive/constants";
import { readBookBody } from "#src/services/genshinAssets/archive/readBookBody";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { GameLanguages } from "genshin-text";
import { GameDataset } from "genshin-world";

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
