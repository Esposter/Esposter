import type { ExcelReliquaryMainPropRow } from "#src/models/genshinAssets/stats/ExcelReliquaryMainPropRow";
import type { ArtifactMainAffixPool } from "genshin-world";

import { ArtifactSlotMainPropDepotMap } from "#src/services/genshinAssets/stats/constants";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { ArtifactMainAffixWeightMap, artifactMainAffixPoolSchema, ArtifactSlot } from "genshin-world";

// Every slot's main affix pool: the attributes its depot holds that the wiki's distribution weighs for the slot. The depot
// Also lists flat attributes and resistances the slot never rolls as its main affix, which the distribution leaves out
export const getArtifactMainAffixPools = (): ArtifactMainAffixPool[] => {
  const mainPropRows = readExcelTable<ExcelReliquaryMainPropRow>("ReliquaryMainPropExcelConfigData");
  return Object.values(ArtifactSlot).map((slot) =>
    artifactMainAffixPoolSchema.parse({
      attributes: mainPropRows
        .filter(
          ({ propDepotId, propType }) =>
            propDepotId === ArtifactSlotMainPropDepotMap[slot] &&
            Object.hasOwn(ArtifactMainAffixWeightMap[slot], propType),
        )
        .map(({ propType }) => propType),
      slot,
    }),
  );
};
