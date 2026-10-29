import type { GcsimCharacter } from "#src/models/genshinAssets/kits/gcsim/GcsimCharacter";
import type { GcsimKitCandidateWriter } from "#src/models/genshinAssets/kits/gcsim/GcsimKitCandidateWriter";

import { GCSIM_BLESSING_NORMAL_ATTACKS_PATH, KIT_LENGTH_KEY } from "#src/services/genshinAssets/kits/constants";
import { checkIsGoFloat } from "#src/services/genshinAssets/kits/gcsim/checkIsGoFloat";
import { createBladeRollerHitbox } from "#src/services/genshinAssets/kits/gcsim/createBladeRollerHitbox";
import { findGcsimConstant } from "#src/services/genshinAssets/kits/gcsim/findGcsimConstant";
import { findGcsimTalentLeaf } from "#src/services/genshinAssets/kits/gcsim/findGcsimTalentLeaf";
import { readElement } from "#src/services/genshinAssets/kits/gcsim/readElement";
import { readGoNumber } from "#src/services/genshinAssets/kits/gcsim/readGoNumber";
import { readPair } from "#src/services/genshinAssets/kits/gcsim/readPair";
import { STRIKE_TARGETING_AREA } from "genshin-world";

// The Blade Roller that plays Xilonen's normal attacks in her blessing: each of its four strikes is one hit at its own
// Animation and hitmark from `rollerFrames`, its area from `rollerHitboxes` and `rollerOffsets`, its poise from
// `rollerPoiseDMG`, and its multiplier from the `attackE` talent variable by its place
export const addGcsimBladeRollerCandidates = (
  { add, addHit, toFile }: GcsimKitCandidateWriter,
  { attacks, config, constantMap }: GcsimCharacter,
): void => {
  const frameList = findGcsimConstant(constantMap, "rollerFrames");
  const hitboxes = findGcsimConstant(constantMap, "rollerHitboxes");
  const offsets = findGcsimConstant(constantMap, "rollerOffsets");
  const poise = findGcsimConstant(constantMap, "rollerPoiseDMG");
  const attack = attacks.find(({ talentVariable }) => talentVariable === "attackE");
  if (frameList === undefined || hitboxes === undefined || offsets === undefined || attack === undefined) return;
  if (!Array.isArray(frameList.value)) return;
  const file = toFile(frameList.file);
  add(`${GCSIM_BLESSING_NORMAL_ATTACKS_PATH}.${KIT_LENGTH_KEY}`, frameList.value.length, file, frameList.line);
  for (const [strikeIndex, strike] of frameList.value.entries()) {
    if (typeof strike !== "object" || Array.isArray(strike) || checkIsGoFloat(strike)) continue;
    const strikePath = `${GCSIM_BLESSING_NORMAL_ATTACKS_PATH}.${strikeIndex}`;
    const strikeLine = frameList.elementLines[strikeIndex] ?? frameList.line;
    const dimensions = readPair(readElement(hitboxes.value, strikeIndex));
    const offsetY = readGoNumber(readElement(offsets.value, strikeIndex));
    const strikePoise = poise === undefined ? undefined : readGoNumber(readElement(poise.value, strikeIndex));
    add(`${strikePath}.hits.${KIT_LENGTH_KEY}`, 1, file, strikeLine);
    add(`${strikePath}.animationFrames`, strike.animationFrames, file, strikeLine);
    addHit(
      `${strikePath}.hits.0`,
      {
        areaHitbox:
          dimensions === undefined || offsetY === undefined
            ? undefined
            : createBladeRollerHitbox(strikeIndex, dimensions, offsetY, hitboxes.line),
        attack,
        ...(strike.hitmarkFrames === undefined
          ? {}
          : { hitmark: { file: frameList.file, line: strikeLine, value: strike.hitmarkFrames } }),
        ...(poise !== undefined &&
          strikePoise !== undefined && { poiseDamage: { line: poise.line, value: strikePoise } }),
        talentLeaf: findGcsimTalentLeaf(config, "attackE", [strikeIndex]),
      },
      STRIKE_TARGETING_AREA,
    );
  }
};
