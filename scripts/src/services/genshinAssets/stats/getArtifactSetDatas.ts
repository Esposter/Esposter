import type { ExcelReliquarySetRow } from "#src/models/genshinAssets/shared/ExcelReliquarySetRow";
import type { ExcelEquipAffixRow } from "#src/models/genshinAssets/stats/ExcelEquipAffixRow";
import type { ArtifactSetData } from "genshin-world";

import { EQUIP_AFFIX_TABLE_NAME, RELIQUARY_SET_TABLE_NAME } from "#src/services/genshinAssets/archive/constants";
import { toAttributeLines } from "#src/services/genshinAssets/stats/toAttributeLines";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { artifactSetDataSchema } from "genshin-world";

// Every artifact set with bonuses, each bonus the attributes its affix adds at its piece count and the numbers its effect
// Reads with the table's trailing zeros cut: a bonus that waits on a condition adds no attributes, and its numbers are
// What its set's module reads. Its description's text hash is the one the names record holds, and empty where the affix
// Has none
export const getArtifactSetDatas = (notes: string[]): ArtifactSetData[] => {
  const affixIdRowsMap = Map.groupBy(readExcelTable<ExcelEquipAffixRow>(EQUIP_AFFIX_TABLE_NAME), ({ id }) => id);
  return readExcelTable<ExcelReliquarySetRow>(RELIQUARY_SET_TABLE_NAME).flatMap(
    ({ equipAffixId, setId, setNeedNum }) => {
      const affixRows = equipAffixId === 0 ? undefined : affixIdRowsMap.get(equipAffixId);
      if (!affixRows) return [];
      return [
        artifactSetDataSchema.parse({
          bonuses: setNeedNum.map((pieceCount, index) => {
            const affixRow = affixRows.find(({ level }) => level === index);
            const paramList = affixRow?.paramList ?? [];
            return {
              attributeLines: toAttributeLines(affixRow?.addProps ?? [], notes),
              descriptionTextHash: affixRow?.descTextMapHash ? String(affixRow.descTextMapHash) : "",
              params: paramList.slice(0, paramList.findLastIndex((param) => param !== 0) + 1),
              pieceCount,
            };
          }),
          id: setId,
        }),
      ];
    },
  );
};
