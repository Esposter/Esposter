import type { GcsimConfig } from "#src/models/genshinAssets/kits/gcsim/GcsimConfig";
import type { GcsimTalentLeaf } from "#src/models/genshinAssets/kits/gcsim/GcsimTalentLeaf";

import { checkIsPathEqual } from "#src/services/genshinAssets/kits/gcsim/checkIsPathEqual";

// The multiplier of a talent variable at a place in its nesting. A place ending in zeroes past the variable's nesting
// Is the multiplier above them, the first hit of a strike with one multiplier the strike's
export const findGcsimTalentLeaf = (
  { talentVariables }: GcsimConfig,
  variable: string | undefined,
  path: readonly number[],
): GcsimTalentLeaf | undefined => {
  const talentVariable = talentVariables.find(({ name }) => name === variable);
  if (talentVariable === undefined) return undefined;
  const trimmedPath = [...path];
  for (;;) {
    const leaf = talentVariable.leaves.find((candidate) => checkIsPathEqual(candidate.path, trimmedPath));
    if (leaf !== undefined || trimmedPath.at(-1) !== 0) return leaf;
    trimmedPath.pop();
  }
};
