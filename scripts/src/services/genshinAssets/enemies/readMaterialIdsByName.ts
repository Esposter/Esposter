import type { MaterialRow } from "#src/models/genshinAssets/shared/MaterialRow";

import { MATERIAL_TABLE_NAME } from "#src/services/genshinAssets/items/constants";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";

// Every material's item ids by its English name, which the wiki names a drop family's materials by
export const readMaterialIdsByName = (englishTextMap: ReadonlyMap<string, string>): Map<string, number[]> => {
  const nameItemIdsMap = new Map<string, number[]>();
  for (const { id, nameTextMapHash } of readExcelTable<MaterialRow>(MATERIAL_TABLE_NAME)) {
    const name = englishTextMap.get(String(nameTextMapHash));
    if (name !== undefined) nameItemIdsMap.set(name, [...(nameItemIdsMap.get(name) ?? []), id]);
  }
  return nameItemIdsMap;
};
