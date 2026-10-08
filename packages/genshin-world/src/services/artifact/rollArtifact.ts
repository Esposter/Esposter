import type { Artifact } from "#src/models/artifact/Artifact";
import type { ArtifactMainAffixPool } from "#src/models/artifact/ArtifactMainAffixPool";
import type { ArtifactRarityData } from "#src/models/artifact/ArtifactRarityData";
import type { AttributeLine } from "#src/models/character/AttributeLine";

import { ArtifactMainAffixWeightMap, ArtifactMinorAffixWeightMap } from "#src/services/artifact/constants";
import { drawWeightedValue } from "#src/services/shared/drawWeightedValue";
import { takeOne } from "@esposter/shared";

// A new artifact at level 0 as a drop gives one: its main affix drawn from its slot's pool by the wiki's weights, then
// Its minor affixes drawn one at a time from the rarity's pool, with the main affix's attribute and each one drawn left
// Out of the next draw. Each minor affix is valued by one of its tiers, every tier as likely as the next
export const rollArtifact = ({
  mainAffixPool,
  minorAffixCount,
  random,
  rarityData,
  setId,
}: {
  mainAffixPool: ArtifactMainAffixPool;
  minorAffixCount: number;
  random: () => number;
  rarityData: ArtifactRarityData;
  setId: number;
}): Artifact => {
  const mainAffixWeightMap = ArtifactMainAffixWeightMap[mainAffixPool.slot];
  const mainAffix = drawWeightedValue(
    mainAffixPool.attributes.map((attribute) => ({ value: attribute, weight: mainAffixWeightMap[attribute] ?? 0 })),
    random,
  );
  let minorAffixGroups = rarityData.minorAffixGroups.filter(({ attribute }) => attribute !== mainAffix);
  const minorAffixes: AttributeLine[] = [];
  for (let index = 0; index < minorAffixCount; index++) {
    const group = drawWeightedValue(
      minorAffixGroups.map((minorAffixGroup) => ({
        value: minorAffixGroup,
        weight: ArtifactMinorAffixWeightMap[minorAffixGroup.attribute] ?? 0,
      })),
      random,
    );
    minorAffixGroups = minorAffixGroups.filter((minorAffixGroup) => minorAffixGroup !== group);
    minorAffixes.push({
      attribute: group.attribute,
      value: takeOne(group.values, Math.floor(random() * group.values.length)),
    });
  }
  return {
    experience: 0,
    isLocked: false,
    level: 0,
    mainAffix,
    minorAffixes,
    rarity: rarityData.rarity,
    setId,
    slot: mainAffixPool.slot,
  };
};
