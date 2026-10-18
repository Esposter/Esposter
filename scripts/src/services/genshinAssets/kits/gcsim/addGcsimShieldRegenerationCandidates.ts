import type { GcsimCharacter } from "#src/models/genshinAssets/kits/gcsim/GcsimCharacter";
import type { GcsimKitCandidateWriter } from "#src/models/genshinAssets/kits/gcsim/GcsimKitCandidateWriter";

import { findGcsimConstant } from "#src/services/genshinAssets/kits/gcsim/findGcsimConstant";
import { readGoNumber } from "#src/services/genshinAssets/kits/gcsim/readGoNumber";

// Radiant Psalter's two shield delays, each with the name gcsim's burst.go declares it by and the path the kit's
// Record holds it at: the frames after a broken shield a new one is made, and after a Benison stack is gained with no
// Shield up
const SHIELD_DELAYS = [
  { constantName: "burstShieldRegenerated", path: "frames.radiantPsalterShieldRegenerated" },
  { constantName: "burstShieldAfterBenisonStack", path: "frames.radiantPsalterShieldAfterBenisonStack" },
] as const;

// Each shield delay as the number its gcsim constant holds, cited at the line the constant is declared on
export const addGcsimShieldRegenerationCandidates = (
  { add, toFile }: GcsimKitCandidateWriter,
  { constantMap }: GcsimCharacter,
): void => {
  for (const { constantName, path } of SHIELD_DELAYS) {
    const constant = findGcsimConstant(constantMap, constantName);
    const value = readGoNumber(constant?.value);
    if (constant !== undefined && value !== undefined) add(path, value, toFile(constant.file), constant.line);
  }
};
