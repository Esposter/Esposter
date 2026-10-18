import type { GcsimCharacter } from "#src/models/genshinAssets/kits/gcsim/GcsimCharacter";
import type { GcsimKitCandidateWriter } from "#src/models/genshinAssets/kits/gcsim/GcsimKitCandidateWriter";

import { addGcsimHitmarkHits } from "#src/services/genshinAssets/kits/gcsim/addGcsimHitmarkHits";
import { findGcsimConstant } from "#src/services/genshinAssets/kits/gcsim/findGcsimConstant";
import { findGcsimHitbox } from "#src/services/genshinAssets/kits/gcsim/findGcsimHitbox";
import { findGcsimTalentLeaf } from "#src/services/genshinAssets/kits/gcsim/findGcsimTalentLeaf";
import { toGoNumbers } from "#src/services/genshinAssets/kits/gcsim/toGoNumbers";
import { STRIKE_TARGETING_AREA } from "genshin-world";

const MOONDEW_CLEANSE_TALENT_VARIABLE = "chargeLB";

// Columbina's charged attack variant, Moondew Cleanse, which her charged attack becomes while Dew is there to spend: its
// Three Lunar-Bloom hits at the hitmarks of `chargeHitmarkBloom`, its frames from `chargeLBFrames`, and each hit's area
// The `CA-Moondew-Cleanse` hitbox on the primary target, and its multiplier the `chargeLB` talent's. Its Dew spend and its
// Defence it ignores are the kit's to give, as the record holds no value for either
export const addGcsimMoondewCleanseCandidates = (writer: GcsimKitCandidateWriter, gcsim: GcsimCharacter): void => {
  const { attacks, config, constantMap } = gcsim;
  const moondewCleanse = attacks.find(({ talentVariable }) => talentVariable === MOONDEW_CLEANSE_TALENT_VARIABLE);
  const hitmarks = findGcsimConstant(constantMap, "chargeHitmarkBloom");
  const hitmarkValues = toGoNumbers(hitmarks?.value);
  if (moondewCleanse === undefined || hitmarks === undefined || hitmarkValues === undefined) return;
  writer.addFrames("chargedAttackVariant.animationFrames", "chargeLBFrames");
  addGcsimHitmarkHits(writer, gcsim, {
    hitmarks: { file: hitmarks.file, line: hitmarks.line, name: hitmarks.name, values: hitmarkValues },
    path: "chargedAttackVariant",
    readHit: () => ({
      areaHitbox: findGcsimHitbox(config, "charge", "CA-Moondew-Cleanse"),
      attack: moondewCleanse,
      talentLeaf: findGcsimTalentLeaf(config, MOONDEW_CLEANSE_TALENT_VARIABLE, []),
    }),
    targetingArea: STRIKE_TARGETING_AREA,
  });
};
