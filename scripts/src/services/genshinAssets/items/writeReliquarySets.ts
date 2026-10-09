import type { ExcelEquipAffixRow } from "#src/models/genshinAssets/archive/ExcelEquipAffixRow";
import type { ExcelReliquarySetRow } from "#src/models/genshinAssets/archive/ExcelReliquarySetRow";
import type { ReliquarySetData } from "genshin-world";

import { EQUIP_AFFIX_TABLE_NAME, RELIQUARY_SET_TABLE_NAME } from "#src/services/genshinAssets/archive/constants";
import { RELIQUARY_SETS_PATH } from "#src/services/genshinAssets/items/constants";
import { writeWorldData } from "#src/services/genshinAssets/shared/writeWorldData";
import { readExcelTable } from "#src/services/genshinAssets/stats/readExcelTable";
import { reliquarySetDataSchema } from "genshin-world";

// Every artifact set the game's set table holds, each with the text id of its name from its equip affix, the pieces it is
// Made of and the counts its bonuses take, written as the world's data, checked against the world's schema. A set whose
// Equip affix names no text is left out. Returns the file's path
export const writeReliquarySets = async (): Promise<string> => {
  const equipAffixNameTextMapHashMap = new Map(
    readExcelTable<ExcelEquipAffixRow>(EQUIP_AFFIX_TABLE_NAME).map(({ id, nameTextMapHash }) => [id, nameTextMapHash]),
  );
  const sets: ReliquarySetData[] = readExcelTable<ExcelReliquarySetRow>(RELIQUARY_SET_TABLE_NAME)
    .flatMap(({ containsList, equipAffixId, setId, setNeedNum }) => {
      const nameTextMapHash = equipAffixNameTextMapHashMap.get(equipAffixId);
      return nameTextMapHash === undefined
        ? []
        : [{ id: setId, nameTextId: String(nameTextMapHash), needCounts: setNeedNum, pieceItemIds: containsList }];
    })
    .toSorted((firstSet, secondSet) => firstSet.id - secondSet.id);
  return writeWorldData(RELIQUARY_SETS_PATH, reliquarySetDataSchema.array().parse(sets));
};
