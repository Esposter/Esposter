import type { GcsimStanceNormalAttack } from "#src/models/genshinAssets/kits/gcsim/GcsimStanceNormalAttack";
import type { KitCandidate } from "#src/models/genshinAssets/kits/KitCandidate";

import { KIT_HIT_MULTIPLIER_REGEX } from "#src/services/genshinAssets/kits/constants";

// The path of a normal attack's hit, `normalAttacks.<index>.hits.<index>`, whose multiplier a stance's hit takes
const NORMAL_ATTACK_HIT_PATH_REGEX = /^normalAttacks\.\d+\.hits\.\d+$/u;

// A stance's normal attack hit takes its multiplier as its normal attack does: every candidate the normal attack's
// Multiplier has, from gcsim and from the tables, so the stance resolves the value its normal attack resolves, the
// Skill's factor aside
export const addStanceMultiplierCandidates = (
  candidateMap: Map<string, KitCandidate[]>,
  { path }: GcsimStanceNormalAttack,
): void => {
  for (const [normalPath, candidates] of candidateMap) {
    const hitPath = KIT_HIT_MULTIPLIER_REGEX.exec(normalPath)?.groups?.hitPath;
    if (hitPath !== undefined && NORMAL_ATTACK_HIT_PATH_REGEX.test(hitPath))
      candidateMap.set(`${path}${normalPath.slice("normalAttacks".length)}`, [...candidates]);
  }
};
