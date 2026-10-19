import type { GcsimAttack } from "#src/models/genshinAssets/kits/gcsim/GcsimAttack";
import type { GcsimCharacter } from "#src/models/genshinAssets/kits/gcsim/GcsimCharacter";
import type { GcsimKitCandidateWriter } from "#src/models/genshinAssets/kits/gcsim/GcsimKitCandidateWriter";

import { findGcsimTalentLeaf } from "#src/services/genshinAssets/kits/gcsim/findGcsimTalentLeaf";
import { findQueuedAttack } from "#src/services/genshinAssets/kits/gcsim/getGcsimQueuedHits";
import { STRIKE_TARGETING_AREA } from "genshin-world";

// Whether an attack is a charged attack's variant's, the `swift` talent variable's: its queue calls are joined to the
// Variant, so the charged attack takes none of them
export const checkIsChargedAttackVariantAttack = ({ talentVariable }: GcsimAttack): boolean =>
  talentVariable === "swift";

// A charged attack's variant: Iansan's Stormflight, the `swift` attack its queue call fires in place of the charged attack
// While its check holds. It joins as the variant's one hit the way a burst variant's kick does: its frames from
// `swiftFrames`, its hitmark from the call's delay, and its element, gauge, poise and multiplier from the attack and its
// Talent leaf. Its area is not read: the swift's fan is no hitbox the reader parses
export const addGcsimChargedAttackVariantCandidates = (
  { add, addFrames, addHit, toFile }: GcsimKitCandidateWriter,
  { attacks, config, queuedAttacks }: GcsimCharacter,
): void => {
  const swift = attacks.find((attack) => checkIsChargedAttackVariantAttack(attack));
  if (swift === undefined) return;
  const swiftCall = queuedAttacks.find(
    (queuedAttack) => queuedAttack.delay !== undefined && findQueuedAttack(attacks, queuedAttack) === swift,
  );
  if (swiftCall?.delay === undefined) return;
  add("chargedAttackVariant.hits.length", 1, toFile(swiftCall.file), swiftCall.delayLine);
  addFrames("chargedAttackVariant.animationFrames", "swiftFrames");
  addHit(
    "chargedAttackVariant.hits.0",
    {
      attack: swift,
      hitmark: { file: swiftCall.file, line: swiftCall.delayLine, value: swiftCall.delay },
      talentLeaf: findGcsimTalentLeaf(config, swift.talentVariable, []),
    },
    STRIKE_TARGETING_AREA,
  );
};
