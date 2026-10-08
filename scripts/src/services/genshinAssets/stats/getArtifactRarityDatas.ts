import type { ExcelReliquaryAffixRow } from "#src/models/genshinAssets/stats/ExcelReliquaryAffixRow";
import type { ExcelReliquaryLevelRow } from "#src/models/genshinAssets/stats/ExcelReliquaryLevelRow";
import type { ExcelReliquaryRow } from "#src/models/genshinAssets/stats/ExcelReliquaryRow";
import type { ArtifactRarityData } from "genshin-world";

import { ArtifactRarityAffixDepotMap } from "#src/services/genshinAssets/stats/constants";
import { readExcelTable } from "#src/services/genshinAssets/stats/readExcelTable";
import { takeOne } from "@esposter/shared";
import { artifactRarityDataSchema } from "genshin-world";

// Every rarity's artifact table, from the standard pieces of that rarity: the levels it reaches above +0, the EXP each one
// Costs to leave, the base EXP a fodder gives, the levels a minor affix is due at, and every minor affix its depot holds
// With each tier of its value. The reliquary table counts levels from one, so its highest level less one is the highest a
// Piece reaches, and a level's cost is the level table's row for it
export const getArtifactRarityDatas = (): ArtifactRarityData[] => {
  const reliquaryRows = readExcelTable<ExcelReliquaryRow>("ReliquaryExcelConfigData");
  const levelRows = readExcelTable<ExcelReliquaryLevelRow>("ReliquaryLevelExcelConfigData");
  const affixRows = readExcelTable<ExcelReliquaryAffixRow>("ReliquaryAffixExcelConfigData");
  return Array.from(ArtifactRarityAffixDepotMap, ([rarity, depotId]) => {
    const rarityRows = reliquaryRows.filter(
      ({ appendPropDepotId, rankLevel, setId }) => setId > 0 && rankLevel === rarity && appendPropDepotId === depotId,
    );
    const { addPropLevels, baseConvExp } = takeOne(rarityRows, 0);
    const maxLevel = Math.max(...rarityRows.map((row) => row.maxLevel)) - 1;
    const levelExperiences = levelRows
      .filter((levelRow) => levelRow.rank === rarity)
      .toSorted((firstRow, secondRow) => firstRow.level - secondRow.level)
      .slice(0, maxLevel)
      .map(({ exp }) => exp);
    const minorAffixGroups = Array.from(
      Map.groupBy(
        affixRows.filter((row) => row.depotId === depotId),
        ({ groupId }) => groupId,
      ).values(),
      (groupRows) => ({
        attribute: takeOne(groupRows, 0).propType,
        values: groupRows
          .map(({ propValue }) => propValue)
          .toSorted((firstValue, secondValue) => firstValue - secondValue),
      }),
    );
    return artifactRarityDataSchema.parse({
      affixLevels: addPropLevels.map((level) => level - 1),
      baseExperience: baseConvExp,
      levelExperiences,
      maxLevel,
      minorAffixGroups,
      rarity,
    });
  });
};
