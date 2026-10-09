import type { BookCandidate } from "#src/models/genshinAssets/archive/BookCandidate";
import type { ExcelBooksCodexRow } from "#src/models/genshinAssets/archive/ExcelBooksCodexRow";
import type { ExcelDocumentRow } from "#src/models/genshinAssets/archive/ExcelDocumentRow";
import type { ExcelLocalizationRow } from "#src/models/genshinAssets/archive/ExcelLocalizationRow";
import type { MaterialRow } from "#src/models/genshinAssets/items/MaterialRow";

import { LOC_TEXT_ASSET_TYPE } from "#src/services/genshinAssets/archive/constants";

// The books the codex lists, each joined to its material's name and to the readable text its document names as its body.
// A row the codex has left out, or whose material, document or body text the dump lacks, is not a book the Archive keeps
export const toBookCandidates = (
  codexRows: readonly ExcelBooksCodexRow[],
  materialRows: readonly Pick<MaterialRow, "id" | "nameTextMapHash">[],
  documentRows: readonly ExcelDocumentRow[],
  localizationRows: readonly Pick<ExcelLocalizationRow, "assetType" | "id">[],
): BookCandidate[] => {
  const nameTextMapHashMap = new Map(materialRows.map(({ id, nameTextMapHash }) => [id, nameTextMapHash]));
  const documentMap = new Map(documentRows.map((documentRow) => [documentRow.id, documentRow]));
  const bodyTextIds = new Set(
    localizationRows.filter(({ assetType }) => assetType === LOC_TEXT_ASSET_TYPE).map(({ id }) => id),
  );
  return codexRows.flatMap(({ id, isDisuse, materialId, sortOrder }) => {
    const nameTextMapHash = nameTextMapHashMap.get(materialId);
    const bodyId = documentMap.get(materialId)?.questIDList[0];
    if (isDisuse || nameTextMapHash === undefined || bodyId === undefined || !bodyTextIds.has(bodyId)) return [];
    return [{ bodyId, id, materialId, nameTextMapHash, sortOrder }];
  });
};
