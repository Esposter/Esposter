import type { ArchiveCandidate } from "#src/models/genshinAssets/archive/ArchiveCandidate";
import type { ExcelBooksCodexRow } from "#src/models/genshinAssets/archive/ExcelBooksCodexRow";
import type { MaterialRow } from "#src/models/genshinAssets/items/MaterialRow";

import { BOOKS_CODEX_TABLE_NAME, MATERIAL_TABLE_NAME } from "#src/services/genshinAssets/archive/constants";
import { readExcelTable } from "#src/services/genshinAssets/stats/readExcelTable";

// The books the Books section lists, each in the codex's order. A book is named by its material's row, the item it is
// Read from in the bag
export const readBookCandidates = (): ArchiveCandidate[] => {
  const nameTextMapHashMap = new Map(
    readExcelTable<MaterialRow>(MATERIAL_TABLE_NAME).map(({ id, nameTextMapHash }) => [id, nameTextMapHash]),
  );
  return readExcelTable<ExcelBooksCodexRow>(BOOKS_CODEX_TABLE_NAME)
    .filter(({ isDisuse }) => !isDisuse)
    .flatMap(({ id, materialId, sortOrder }) => {
      const nameTextMapHash = nameTextMapHashMap.get(materialId);
      return nameTextMapHash === undefined ? [] : [{ id, nameTextMapHash, sortOrder }];
    });
};
