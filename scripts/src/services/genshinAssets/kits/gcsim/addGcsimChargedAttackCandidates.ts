import type { GcsimCharacter } from "#src/models/genshinAssets/kits/gcsim/GcsimCharacter";
import type { GcsimKitCandidateWriter } from "#src/models/genshinAssets/kits/gcsim/GcsimKitCandidateWriter";

import {
  GCSIM_AIM_CHARGE_LEVEL,
  GCSIM_CHARGED_ATTACK_TAG,
  NO_ACTION_FILE_CLAYMORE_CHARGED_ANIMATION_FRAMES,
  NO_ACTION_FILE_CLAYMORE_CHARGED_HITMARK_FRAMES,
} from "#src/services/genshinAssets/kits/constants";
import { addGcsimQueuedHits } from "#src/services/genshinAssets/kits/gcsim/addGcsimQueuedHits";
import { checkIsGoFloat } from "#src/services/genshinAssets/kits/gcsim/checkIsGoFloat";
import { findGcsimConstant } from "#src/services/genshinAssets/kits/gcsim/findGcsimConstant";
import { findGcsimHitbox } from "#src/services/genshinAssets/kits/gcsim/findGcsimHitbox";
import { findGcsimTalentLeaf } from "#src/services/genshinAssets/kits/gcsim/findGcsimTalentLeaf";
import { getGcsimLandingFrames } from "#src/services/genshinAssets/kits/gcsim/getGcsimLandingFrames";
import { toGoNumbers } from "#src/services/genshinAssets/kits/gcsim/toGoNumbers";
import { STRIKE_TARGETING_AREA, WeaponType } from "genshin-world";

// The charged attack: its hitmarks from `chargeHitmark` or `chargeHitmarks`, its frames from `chargeFrames`, and its
// Hits' areas from the `CA` or `CA-<hit>` hitboxes. A bow's is its aimed shot at gcsim's default charge level, which
// Drains no stamina, its hitmark and frames that level's in `aimedHitmarks` and `aimedFrames`, its area the `FullAim`
// Hitbox and its multiplier `fullaim`'s. A claymore's with no frames takes the shared rule
export const addGcsimChargedAttackCandidates = (
  writer: GcsimKitCandidateWriter,
  gcsim: GcsimCharacter,
  weaponType: WeaponType,
): void => {
  const { add, addFrames, addHit, addNoActionFileRule, toFile } = writer;
  const { attacks, config, constantMap, travelMap } = gcsim;
  const chargedAttack = attacks.find(({ attackTag }) => attackTag === GCSIM_CHARGED_ATTACK_TAG);
  const chargedHitmarks = findGcsimConstant(constantMap, "chargeHitmarks", "chargeHitmark");
  const chargedHitmarkValues = toGoNumbers(chargedHitmarks?.value);
  const aimedHitmarks = findGcsimConstant(constantMap, "aimedHitmarks");
  const aimedHitmark = toGoNumbers(aimedHitmarks?.value)?.[GCSIM_AIM_CHARGE_LEVEL];
  const aimedFrames = findGcsimConstant(constantMap, "aimedFrames");
  if (chargedHitmarks !== undefined && chargedHitmarkValues !== undefined) {
    add("chargedAttack.hits.length", chargedHitmarkValues.length, toFile(chargedHitmarks.file), chargedHitmarks.line);
    addFrames("chargedAttack.animationFrames", "chargeFrames");
    for (const [hitIndex, hitmark] of chargedHitmarkValues.entries())
      addHit(
        `chargedAttack.hits.${hitIndex}`,
        {
          areaHitbox: findGcsimHitbox(config, "charge", `CA-${hitIndex + 1}`, "CA"),
          attack: chargedAttack,
          hitmark: {
            file: chargedHitmarks.file,
            line: chargedHitmarks.line,
            value: getGcsimLandingFrames(travelMap, chargedHitmarks.name, hitmark),
          },
          talentLeaf: findGcsimTalentLeaf(config, chargedAttack?.talentVariable, [hitIndex]),
        },
        STRIKE_TARGETING_AREA,
      );
  } else if (aimedHitmarks !== undefined && aimedHitmark !== undefined) {
    add("chargedAttack.hits.length", 1, toFile(aimedHitmarks.file), aimedHitmarks.line);
    add("chargedAttack.isAimed", true, toFile(aimedHitmarks.file), aimedHitmarks.line);
    add("chargedAttackStamina", 0, toFile(aimedHitmarks.file), aimedHitmarks.line);
    const aimedLevelFrames = Array.isArray(aimedFrames?.value) ? aimedFrames.value[GCSIM_AIM_CHARGE_LEVEL] : undefined;
    if (
      aimedFrames !== undefined &&
      typeof aimedLevelFrames === "object" &&
      !Array.isArray(aimedLevelFrames) &&
      !checkIsGoFloat(aimedLevelFrames)
    )
      add(
        "chargedAttack.animationFrames",
        aimedLevelFrames.animationFrames,
        toFile(aimedFrames.file),
        aimedFrames.elementLines[GCSIM_AIM_CHARGE_LEVEL] ?? aimedFrames.line,
      );
    addHit(
      "chargedAttack.hits.0",
      {
        areaHitbox: findGcsimHitbox(config, "aim", "FullAim"),
        attack: chargedAttack,
        hitmark: {
          file: aimedHitmarks.file,
          line: aimedHitmarks.line,
          value: getGcsimLandingFrames(travelMap, aimedHitmarks.name, aimedHitmark),
        },
        talentLeaf: findGcsimTalentLeaf(config, "fullaim", []),
      },
      STRIKE_TARGETING_AREA,
    );
  } else {
    // A charged attack no hitmark constant gives is fired by its queue call, as a bow's or a Mualani's inline one is
    addFrames("chargedAttack.animationFrames", "chargeFrames");
    addGcsimQueuedHits(writer, gcsim, {
      abilityName: "charge",
      attackTags: [GCSIM_CHARGED_ATTACK_TAG],
      framesName: "chargeFrames",
      path: "chargedAttack",
      targetingArea: STRIKE_TARGETING_AREA,
    });
  }

  if (
    findGcsimConstant(constantMap, "chargeFrames", "aimedFrames") === undefined &&
    weaponType === WeaponType.Claymore
  ) {
    addNoActionFileRule("chargedAttack.hits.length", NO_ACTION_FILE_CLAYMORE_CHARGED_HITMARK_FRAMES.length);
    addNoActionFileRule("chargedAttack.animationFrames", NO_ACTION_FILE_CLAYMORE_CHARGED_ANIMATION_FRAMES);
    for (const [hitIndex, hitmark] of NO_ACTION_FILE_CLAYMORE_CHARGED_HITMARK_FRAMES.entries())
      addNoActionFileRule(`chargedAttack.hits.${hitIndex}.hitmarkFrames`, hitmark);
  }
};
