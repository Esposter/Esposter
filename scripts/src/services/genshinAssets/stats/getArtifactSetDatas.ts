import type { ExcelEquipAffixRow } from "#src/models/genshinAssets/stats/ExcelEquipAffixRow";
import type { ExcelReliquarySetRow } from "#src/models/genshinAssets/stats/ExcelReliquarySetRow";
import type { ArtifactSetData } from "genshin-world";

import { toAttributeLines } from "#src/services/genshinAssets/stats/toAttributeLines";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { artifactSetDataSchema } from "genshin-world";

// Every artifact set with bonuses, each bonus the attributes its affix adds at its piece count and the numbers its effect
// Reads with the table's trailing zeros cut: a bonus that waits on a condition adds no attributes, and its numbers are
// What its set's module reads
export const getArtifactSetDatas = (notes: string[]): ArtifactSetData[] => {
  const affixIdRowsMap = Map.groupBy(readExcelTable<ExcelEquipAffixRow>("EquipAffixExcelConfigData"), ({ id }) => id);
  return readExcelTable<ExcelReliquarySetRow>("ReliquarySetExcelConfigData").flatMap(
    ({ equipAffixId, setId, setNeedNum }) => {
      const affixRows = equipAffixId === undefined ? undefined : affixIdRowsMap.get(equipAffixId);
      if (!affixRows) return [];
      return [
        artifactSetDataSchema.parse({
          bonuses: setNeedNum.map((pieceCount, index) => {
            const affixRow = affixRows.find(({ level = 0 }) => level === index);
            const paramList = affixRow?.paramList ?? [];
            return {
              attributeLines: toAttributeLines(affixRow?.addProps ?? [], notes),
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
