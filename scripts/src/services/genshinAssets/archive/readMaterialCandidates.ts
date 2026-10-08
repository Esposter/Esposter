import type { ArchiveCandidate } from "#src/models/genshinAssets/archive/ArchiveCandidate";
import type { ExcelMaterialCodexRow } from "#src/models/genshinAssets/archive/ExcelMaterialCodexRow";
import type { MaterialRow } from "#src/models/genshinAssets/items/MaterialRow";

import { MATERIAL_CODEX_TABLE_NAME, MATERIAL_TABLE_NAME } from "#src/services/genshinAssets/archive/constants";
import { readExcelTable } from "#src/services/genshinAssets/stats/readExcelTable";

// The materials the Materials section lists, each in the codex's order and named by its row in the material table
export const readMaterialCandidates = (): ArchiveCandidate[] => {
  const nameTextMapHashMap = new Map(
    readExcelTable<MaterialRow>(MATERIAL_TABLE_NAME).map(({ id, nameTextMapHash }) => [id, nameTextMapHash]),
  );
  return readExcelTable<ExcelMaterialCodexRow>(MATERIAL_CODEX_TABLE_NAME)
    .filter(({ isDisuse }) => !isDisuse)
    .flatMap(({ materialId, sortOrder }) => {
      const nameTextMapHash = nameTextMapHashMap.get(materialId);
      return nameTextMapHash === undefined ? [] : [{ id: materialId, nameTextMapHash, sortOrder }];
    });
};
