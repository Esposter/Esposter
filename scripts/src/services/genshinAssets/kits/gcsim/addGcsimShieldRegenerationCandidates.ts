import type { GcsimCharacter } from "#src/models/genshinAssets/kits/gcsim/GcsimCharacter";
import type { GcsimKitCandidateWriter } from "#src/models/genshinAssets/kits/gcsim/GcsimKitCandidateWriter";

import { findGcsimConstant } from "#src/services/genshinAssets/kits/gcsim/findGcsimConstant";
import { readGoNumber } from "#src/services/genshinAssets/kits/gcsim/readGoNumber";

// Radiant Psalter's three shield delays, each with the name gcsim's burst.go declares it by and the path the kit's
// Record holds it at: the frames before its first shield is placed, after a broken shield a new one is made, and after
// A Benison stack is gained with no shield up
const SHIELD_DELAYS = [
  { constantName: "burstShieldRegenerated", path: "frames.radiantPsalterShieldRegenerated" },
  { constantName: "burstShieldAfterBenisonStack", path: "frames.radiantPsalterShieldAfterBenisonStack" },
  { constantName: "burstShieldInitial", path: "frames.radiantPsalterShield" },
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
