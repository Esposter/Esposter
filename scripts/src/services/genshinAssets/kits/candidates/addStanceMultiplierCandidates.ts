import type { GcsimStanceNormalAttack } from "#src/models/genshinAssets/kits/gcsim/GcsimStanceNormalAttack";
import type { KitCandidate } from "#src/models/genshinAssets/kits/KitCandidate";

const NORMAL_ATTACK_MULTIPLIER_REGEX = /^normalAttacks\.\d+\.hits\.\d+\.multiplier$/u;

// A stance's normal attack hit takes its multiplier as its normal attack does: every candidate the normal attack's multiplier
// Has, from gcsim and from the tables, so the stance resolves the value its normal attack resolves, the skill's factor aside
export const addStanceMultiplierCandidates = (
  candidateMap: Map<string, KitCandidate[]>,
  { path }: GcsimStanceNormalAttack,
): void => {
  for (const [normalPath, candidates] of candidateMap)
    if (NORMAL_ATTACK_MULTIPLIER_REGEX.test(normalPath))
      candidateMap.set(`${path}${normalPath.slice("normalAttacks".length)}`, [...candidates]);
};
