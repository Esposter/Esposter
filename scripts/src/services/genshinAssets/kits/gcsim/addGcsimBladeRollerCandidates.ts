import type { GcsimCharacter } from "#src/models/genshinAssets/kits/gcsim/GcsimCharacter";
import type { GcsimHitbox } from "#src/models/genshinAssets/kits/gcsim/GcsimHitbox";
import type { GcsimKitCandidateWriter } from "#src/models/genshinAssets/kits/gcsim/GcsimKitCandidateWriter";
import type { GoValue } from "#src/models/genshinAssets/kits/gcsim/GoValue";

import { GcsimHitboxCenter } from "#src/models/genshinAssets/kits/gcsim/GcsimHitboxCenter";
import { GcsimHitboxShape } from "#src/models/genshinAssets/kits/gcsim/GcsimHitboxShape";
import { checkIsGoFloat } from "#src/services/genshinAssets/kits/gcsim/checkIsGoFloat";
import { findGcsimConstant } from "#src/services/genshinAssets/kits/gcsim/findGcsimConstant";
import { findGcsimTalentLeaf } from "#src/services/genshinAssets/kits/gcsim/findGcsimTalentLeaf";
import { readGoNumber } from "#src/services/genshinAssets/kits/gcsim/readGoNumber";
import { toGoNumbers } from "#src/services/genshinAssets/kits/gcsim/toGoNumbers";
import { STRIKE_TARGETING_AREA } from "genshin-world";

const BLADE_ROLLER_PATH = "stances.blessing.normalAttacks";

// An element of a constant's list at an index, where the constant is a list
const readElement = (value: GoValue | undefined, index: number): GoValue | undefined =>
  Array.isArray(value) ? value[index] : undefined;

// A pair of numbers, its two dimensions in order
const readPair = (value: GoValue | undefined): [number, number] | undefined => {
  const [first, second] = toGoNumbers(value) ?? [];
  return first === undefined || second === undefined ? undefined : [first, second];
};

// A strike's hitbox from its two dimensions and its offset ahead of the body. gcsim's first and fourth strikes are fans,
// A circle of radius and angle, and its second and third are boxes of width and length, each on the player
const createBladeRollerHitbox = (
  strikeIndex: number,
  [first, second]: [number, number],
  offsetY: number,
  line: number,
): GcsimHitbox => {
  const base = {
    center: GcsimHitboxCenter.Player,
    file: "attack.go",
    line,
    name: `roller${strikeIndex + 1}`,
    offset: [0, offsetY] as [number, number],
  };
  return strikeIndex === 0 || strikeIndex === 3
    ? { ...base, fanAngle: second, radius: first, shape: GcsimHitboxShape.Circle }
    : { ...base, box: [first, second], shape: GcsimHitboxShape.Box };
};

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
  add(`${BLADE_ROLLER_PATH}.length`, frameList.value.length, file, frameList.line);
  for (const [strikeIndex, strike] of frameList.value.entries()) {
    if (typeof strike !== "object" || Array.isArray(strike) || checkIsGoFloat(strike)) continue;
    const strikePath = `${BLADE_ROLLER_PATH}.${strikeIndex}`;
    const strikeLine = frameList.elementLines[strikeIndex] ?? frameList.line;
    const dimensions = readPair(readElement(hitboxes.value, strikeIndex));
    const offsetY = readGoNumber(readElement(offsets.value, strikeIndex));
    const strikePoise = poise === undefined ? undefined : readGoNumber(readElement(poise.value, strikeIndex));
    add(`${strikePath}.hits.length`, 1, file, strikeLine);
    add(`${strikePath}.animationFrames`, strike.animationFrames, file, strikeLine);
    addHit(
      `${strikePath}.hits.0`,
      {
        areaHitbox:
          dimensions === undefined || offsetY === undefined
            ? undefined
            : createBladeRollerHitbox(strikeIndex, dimensions, offsetY, hitboxes.line),
        attack,
        hitmark: { file: frameList.file, line: strikeLine, value: strike.hitmarkFrames },
        ...(poise !== undefined &&
          strikePoise !== undefined && { poiseDamage: { line: poise.line, value: strikePoise } }),
        talentLeaf: findGcsimTalentLeaf(config, "attackE", [strikeIndex]),
      },
      STRIKE_TARGETING_AREA,
    );
  }
};
