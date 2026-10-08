import type { Artifact } from "#src/models/artifact/Artifact";
import type { ArtifactRarityData } from "#src/models/artifact/ArtifactRarityData";

import { EXPERIENCE_BONUS_WEIGHTS } from "#src/services/artifact/constants";
import { enhanceMinorAffixes } from "#src/services/artifact/enhanceMinorAffixes";
import { getArtifactRarityData } from "#src/services/artifact/getArtifactRarityData";
import { getFodderEnhancement } from "#src/services/artifact/getFodderEnhancement";
import { drawWeightedValue } from "#src/services/shared/drawWeightedValue";
import { takeOne } from "@esposter/shared";

// An artifact fed the materials' EXP and its fodders': the bonus drawn for the enhancement multiplies what they bring, and
// The artifact levels as far as its EXP now reaches, a minor affix added or raised at each affix level it passes. EXP past
// The highest level is lost. The Mora is paid before this, as getEnhancementMoraCost says
export const enhanceArtifact = ({
  artifact,
  artifactRarityDataMap,
  fodders,
  materialExperience,
  random,
}: {
  artifact: Artifact;
  artifactRarityDataMap: ReadonlyMap<number, ArtifactRarityData>;
  fodders: readonly Artifact[];
  materialExperience: number;
  random: () => number;
}): Artifact => {
  const rarityData = getArtifactRarityData(artifactRarityDataMap, artifact.rarity);
  const fedExperience = fodders.reduce(
    (total, fodder) => total + getFodderEnhancement(fodder, artifactRarityDataMap).experience,
    materialExperience,
  );
  const experienceBonus = drawWeightedValue(EXPERIENCE_BONUS_WEIGHTS, random);
  const totalExperience = rarityData.levelExperiences.reduce((total, levelExperience) => total + levelExperience, 0);
  const experience = Math.min(artifact.experience + fedExperience * experienceBonus, totalExperience);
  let level = artifact.level;
  let levelExperience = rarityData.levelExperiences.slice(0, level).reduce((total, cost) => total + cost, 0);
  let minorAffixes = artifact.minorAffixes;
  while (level < rarityData.maxLevel) {
    const nextLevelExperience = levelExperience + takeOne(rarityData.levelExperiences, level);
    if (nextLevelExperience > experience) break;
    levelExperience = nextLevelExperience;
    level++;
    if (rarityData.affixLevels.includes(level))
      minorAffixes = enhanceMinorAffixes({
        mainAffix: artifact.mainAffix,
        minorAffixes,
        minorAffixGroups: rarityData.minorAffixGroups,
        random,
      });
  }
  return { ...artifact, experience, level, minorAffixes };
};
