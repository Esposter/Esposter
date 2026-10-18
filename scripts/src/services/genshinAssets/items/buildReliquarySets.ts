import type { ExcelEquipAffixRow } from "#src/models/genshinAssets/archive/ExcelEquipAffixRow";
import type { ExcelReliquarySetRow } from "#src/models/genshinAssets/archive/ExcelReliquarySetRow";
import type { ExcelReliquaryRow } from "#src/models/genshinAssets/stats/ExcelReliquaryRow";

import {
  EQUIP_AFFIX_TABLE_NAME,
  RELIQUARY_SET_TABLE_NAME,
  RELIQUARY_TABLE_NAME,
} from "#src/services/genshinAssets/archive/constants";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { GameDataset, reliquarySetDataSchema } from "genshin-world";

// Every artifact set the game's set table holds, each with the text id of its name from its equip affix, the counts its
// Bonuses take and each piece it is made of, the piece's slot, rank and rarity read from the reliquary table. A set whose
// Equip affix names no text is left out. Returns the record the sets publish under
export const buildReliquarySets = (): Record<string, unknown> => {
  const equipAffixNameTextMapHashMap = new Map(
    readExcelTable<ExcelEquipAffixRow>(EQUIP_AFFIX_TABLE_NAME).map(({ id, nameTextMapHash }) => [id, nameTextMapHash]),
  );
  const reliquaryRowMap = new Map(readExcelTable<ExcelReliquaryRow>(RELIQUARY_TABLE_NAME).map((row) => [row.id, row]));
  const toPiece = (setId: number, itemId: number) => {
    const row = reliquaryRowMap.get(itemId);
    if (!row)
      throw new InvalidOperationError(
        Operation.Read,
        RELIQUARY_TABLE_NAME,
        `holds no row for piece ${itemId} of set ${setId}`,
      );
    return {
      itemId,
      nameTextId: String(row.nameTextMapHash),
      rank: row.rank,
      rarity: row.rankLevel,
      slot: row.equipType,
    };
  };
  const sets = readExcelTable<ExcelReliquarySetRow>(RELIQUARY_SET_TABLE_NAME)
    .flatMap(({ containsList, equipAffixId, setId, setNeedNum }) => {
      const nameTextMapHash = equipAffixNameTextMapHashMap.get(equipAffixId);
      return nameTextMapHash === undefined
        ? []
        : [
            {
              id: setId,
              nameTextId: String(nameTextMapHash),
              needCounts: setNeedNum,
              pieces: containsList.map((itemId) => toPiece(setId, itemId)),
            },
          ];
    })
    .toSorted((firstSet, secondSet) => firstSet.id - secondSet.id);
  // The slot is the game's equip type, which the set schema checks against the slots an artifact is worn in
  return { [`${GameDataset.Items}/reliquarySets`]: reliquarySetDataSchema.array().parse(sets) };
};
