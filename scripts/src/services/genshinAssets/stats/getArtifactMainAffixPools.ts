import type { ExcelReliquaryMainPropRow } from "#src/models/genshinAssets/stats/ExcelReliquaryMainPropRow";
import type { ArtifactMainAffixPool } from "genshin-world";

import { ArtifactSlotMainPropDepotMap } from "#src/services/genshinAssets/stats/constants";
import { readExcelTable } from "#src/services/genshinAssets/stats/readExcelTable";
import { artifactMainAffixPoolSchema, ArtifactSlot } from "genshin-world";

// Every slot's main affix pool: the attributes its depot holds, which the wiki's weights then draw among
export const getArtifactMainAffixPools = (): ArtifactMainAffixPool[] => {
  const mainPropRows = readExcelTable<ExcelReliquaryMainPropRow>("ReliquaryMainPropExcelConfigData");
  return Object.values(ArtifactSlot).map((slot) =>
    artifactMainAffixPoolSchema.parse({
      attributes: mainPropRows
        .filter(({ propDepotId }) => propDepotId === ArtifactSlotMainPropDepotMap[slot])
        .map(({ propType }) => propType),
      slot,
    }),
  );
};
