import type { ExcelEquipAffixRow } from "#src/models/genshinAssets/stats/ExcelEquipAffixRow";
import type { ExcelReliquarySetRow } from "#src/models/genshinAssets/stats/ExcelReliquarySetRow";
import type { ArtifactSetData } from "genshin-world";

import { readExcelTable } from "#src/services/genshinAssets/stats/readExcelTable";
import { toAttributeLines } from "#src/services/genshinAssets/stats/toAttributeLines";
import { artifactSetDataSchema } from "genshin-world";

// Every artifact set with bonuses, each bonus the attributes its affix adds at its piece count: a bonus that waits on
// A condition adds none, and is the set's description alone
export const getArtifactSetDatas = (notes: string[]): ArtifactSetData[] => {
  const affixIdRowsMap = Map.groupBy(readExcelTable<ExcelEquipAffixRow>("EquipAffixExcelConfigData"), ({ id }) => id);
  return readExcelTable<ExcelReliquarySetRow>("ReliquarySetExcelConfigData").flatMap(
    ({ equipAffixId, setId, setNeedNum }) => {
      const affixRows = equipAffixId === undefined ? undefined : affixIdRowsMap.get(equipAffixId);
      if (!affixRows) return [];
      return [
        artifactSetDataSchema.parse({
          bonuses: setNeedNum.map((pieceCount, index) => ({
            attributeLines: toAttributeLines(affixRows.find(({ level = 0 }) => level === index)?.addProps ?? [], notes),
            pieceCount,
          })),
          id: setId,
        }),
      ];
    },
  );
};
