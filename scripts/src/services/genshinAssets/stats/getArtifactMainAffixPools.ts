import type { ExcelReliquaryMainPropRow } from "#src/models/genshinAssets/stats/ExcelReliquaryMainPropRow";
import type { ArtifactMainAffixPool } from "genshin-world";

import { RELIQUARY_MAIN_PROP_TABLE_NAME } from "#src/services/genshinAssets/archive/constants";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { artifactMainAffixPoolSchema, ArtifactMainAffixWeightMap, ArtifactSlot } from "genshin-world/definitions";

// Every slot's main affix pool: the attributes its depot holds that the wiki's distribution weighs for the slot. The
// Depot also lists flat attributes and resistances the slot never rolls as its main affix, which the distribution
// Leaves out
export const getArtifactMainAffixPools = (
  slotMainPropDepots: ReadonlyMap<ArtifactSlot, number>,
): ArtifactMainAffixPool[] => {
  const mainPropRows = readExcelTable<ExcelReliquaryMainPropRow>(RELIQUARY_MAIN_PROP_TABLE_NAME);
  return Object.values(ArtifactSlot).map((slot) =>
    artifactMainAffixPoolSchema.parse({
      attributes: mainPropRows
        .filter(
          ({ propDepotId, propType }) =>
            propDepotId === slotMainPropDepots.get(slot) && Object.hasOwn(ArtifactMainAffixWeightMap[slot], propType),
        )
        .map(({ propType }) => propType),
      slot,
    }),
  );
};
