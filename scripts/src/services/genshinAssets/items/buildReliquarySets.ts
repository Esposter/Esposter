import type { ExcelEquipAffixRow } from "#src/models/genshinAssets/archive/ExcelEquipAffixRow";
import type { ExcelReliquarySetRow } from "#src/models/genshinAssets/archive/ExcelReliquarySetRow";
import type { ReliquarySetData } from "genshin-world";

import { EQUIP_AFFIX_TABLE_NAME, RELIQUARY_SET_TABLE_NAME } from "#src/services/genshinAssets/archive/constants";
import { readExcelTable } from "#src/services/genshinAssets/stats/readExcelTable";
import { GameDataset, reliquarySetDataSchema } from "genshin-world";

// Every artifact set the game's set table holds, each with the text id of its name from its equip affix, the pieces it is
// Made of and the counts its bonuses take, checked against the world's schema. A set whose equip affix names no text is
// Left out. Returns the record the sets publish under
export const buildReliquarySets = (): Record<string, unknown> => {
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
  return { [`${GameDataset.Items}/reliquarySets`]: reliquarySetDataSchema.array().parse(sets) };
};
