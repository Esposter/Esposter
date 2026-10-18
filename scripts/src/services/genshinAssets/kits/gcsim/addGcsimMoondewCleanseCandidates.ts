import type { GcsimCharacter } from "#src/models/genshinAssets/kits/gcsim/GcsimCharacter";
import type { GcsimKitCandidateWriter } from "#src/models/genshinAssets/kits/gcsim/GcsimKitCandidateWriter";

import { findGcsimConstant } from "#src/services/genshinAssets/kits/gcsim/findGcsimConstant";
import { findGcsimHitbox } from "#src/services/genshinAssets/kits/gcsim/findGcsimHitbox";
import { findGcsimTalentLeaf } from "#src/services/genshinAssets/kits/gcsim/findGcsimTalentLeaf";
import { getGcsimLandingFrames } from "#src/services/genshinAssets/kits/gcsim/getGcsimLandingFrames";
import { toGoNumbers } from "#src/services/genshinAssets/kits/gcsim/toGoNumbers";
import { STRIKE_TARGETING_AREA } from "genshin-world";

const MOONDEW_CLEANSE_TALENT_VARIABLE = "chargeLB";

// Columbina's charged attack variant, Moondew Cleanse, which her charged attack becomes while Dew is there to spend: its
// Three Lunar-Bloom hits at the hitmarks of `chargeHitmarkBloom`, its frames from `chargeLBFrames`, and each hit's area
// The `CA-Moondew-Cleanse` hitbox on the primary target, and its multiplier the `chargeLB` talent's. Its Dew spend and its
// Defence it ignores are the kit's to give, as the record holds no value for either
export const addGcsimMoondewCleanseCandidates = (
  { add, addFrames, addHit, toFile }: GcsimKitCandidateWriter,
  { attacks, config, constantMap, travelMap }: GcsimCharacter,
): void => {
  const moondewCleanse = attacks.find(({ talentVariable }) => talentVariable === MOONDEW_CLEANSE_TALENT_VARIABLE);
  const hitmarks = findGcsimConstant(constantMap, "chargeHitmarkBloom");
  const hitmarkValues = toGoNumbers(hitmarks?.value);
  if (moondewCleanse === undefined || hitmarks === undefined || hitmarkValues === undefined) return;
  add("chargedAttackVariant.hits.length", hitmarkValues.length, toFile(hitmarks.file), hitmarks.line);
  addFrames("chargedAttackVariant.animationFrames", "chargeLBFrames");
  for (const [hitIndex, hitmark] of hitmarkValues.entries())
    addHit(
      `chargedAttackVariant.hits.${hitIndex}`,
      {
        areaHitbox: findGcsimHitbox(config, "charge", "CA-Moondew-Cleanse"),
        attack: moondewCleanse,
        hitmark: {
          file: hitmarks.file,
          line: hitmarks.line,
          value: getGcsimLandingFrames(travelMap, hitmarks.name, hitmark),
        },
        talentLeaf: findGcsimTalentLeaf(config, MOONDEW_CLEANSE_TALENT_VARIABLE, []),
      },
      STRIKE_TARGETING_AREA,
    );
};
