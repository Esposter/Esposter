import type { ExcelEquipAffixRow } from "#src/models/genshinAssets/archive/ExcelEquipAffixRow";
import type { ExcelReliquarySetRow } from "#src/models/genshinAssets/archive/ExcelReliquarySetRow";
import type { ExcelReliquaryRow } from "#src/models/genshinAssets/stats/ExcelReliquaryRow";

import {
  EQUIP_AFFIX_TABLE_NAME,
  RELIQUARY_SET_TABLE_NAME,
  RELIQUARY_TABLE_NAME,
} from "#src/services/genshinAssets/archive/constants";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { GameDataset, reliquarySetDataSchema } from "genshin-world";

// The piece a reliquary row is: its item id, the text id of its name, its rank, rarity and slot, and how many minor affixes
// It starts with, which a row that names none leaves at zero
const toPiece = ({ appendPropNum, equipType, id, nameTextMapHash, rank, rankLevel }: ExcelReliquaryRow) => ({
  itemId: id,
  nameTextId: String(nameTextMapHash),
  rank,
  rarity: rankLevel,
  slot: equipType,
  startingMinorCount: appendPropNum ?? 0,
});

// Every artifact set the game's set table holds, each with the text id of its name from its equip affix, the counts its
// Bonuses take and each piece it is made of. A piece is every row of the reliquary table that belongs to the set, one per
// Slot, rank, rarity and starting minor affix count, so a piece is what a rolled artifact of the set is named by. A set
// Whose equip affix names no text is left out. Returns the record the sets publish under
export const buildReliquarySets = (): Record<string, unknown> => {
  const equipAffixNameTextMapHashMap = new Map(
    readExcelTable<ExcelEquipAffixRow>(EQUIP_AFFIX_TABLE_NAME).map(({ id, nameTextMapHash }) => [id, nameTextMapHash]),
  );
  const setRowsMap = new Map<number, ExcelReliquaryRow[]>();
  for (const row of readExcelTable<ExcelReliquaryRow>(RELIQUARY_TABLE_NAME)) {
    if (!row.setId) continue;
    setRowsMap.set(row.setId, [...(setRowsMap.get(row.setId) ?? []), row]);
  }
  const sets = readExcelTable<ExcelReliquarySetRow>(RELIQUARY_SET_TABLE_NAME)
    .flatMap(({ equipAffixId, setId, setNeedNum }) => {
      const nameTextMapHash = equipAffixNameTextMapHashMap.get(equipAffixId);
      return nameTextMapHash === undefined
        ? []
        : [
            {
              id: setId,
              nameTextId: String(nameTextMapHash),
              needCounts: setNeedNum,
              pieces: (setRowsMap.get(setId) ?? []).map((row) => toPiece(row)),
            },
          ];
    })
    .toSorted((firstSet, secondSet) => firstSet.id - secondSet.id);
  // The slot is the game's equip type, which the set schema checks against the slots an artifact is worn in
  return { [`${GameDataset.Items}/reliquarySets`]: reliquarySetDataSchema.array().parse(sets) };
};
