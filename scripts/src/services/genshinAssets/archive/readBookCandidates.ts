import type { BookCandidate } from "#src/models/genshinAssets/archive/BookCandidate";
import type { ExcelBooksCodexRow } from "#src/models/genshinAssets/archive/ExcelBooksCodexRow";
import type { ExcelDocumentRow } from "#src/models/genshinAssets/archive/ExcelDocumentRow";
import type { ExcelLocalizationRow } from "#src/models/genshinAssets/archive/ExcelLocalizationRow";
import type { MaterialRow } from "#src/models/genshinAssets/items/MaterialRow";

import {
  BOOKS_CODEX_TABLE_NAME,
  DOCUMENT_TABLE_NAME,
  LOCALIZATION_TABLE_NAME,
  MATERIAL_TABLE_NAME,
} from "#src/services/genshinAssets/archive/constants";
import { toBookCandidates } from "#src/services/genshinAssets/archive/toBookCandidates";
import { readExcelTable } from "#src/services/genshinAssets/stats/readExcelTable";

// The books the Books section lists, each in the codex's order, named by its material's row and read from the body its
// Document names
export const readBookCandidates = (): BookCandidate[] =>
  toBookCandidates(
    readExcelTable<ExcelBooksCodexRow>(BOOKS_CODEX_TABLE_NAME),
    readExcelTable<MaterialRow>(MATERIAL_TABLE_NAME),
    readExcelTable<ExcelDocumentRow>(DOCUMENT_TABLE_NAME),
    readExcelTable<ExcelLocalizationRow>(LOCALIZATION_TABLE_NAME),
  );
