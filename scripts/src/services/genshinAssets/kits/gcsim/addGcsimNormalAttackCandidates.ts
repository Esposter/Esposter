import type { GcsimCharacter } from "#src/models/genshinAssets/kits/gcsim/GcsimCharacter";
import type { GcsimKitCandidateWriter } from "#src/models/genshinAssets/kits/gcsim/GcsimKitCandidateWriter";
import type { GcsimHitbox } from "#src/models/genshinAssets/kits/gcsim/GcsimHitbox";
import type { GcsimHitSource } from "#src/models/genshinAssets/kits/gcsim/GcsimHitSource";
import type { GcsimStanceNormalAttack } from "#src/models/genshinAssets/kits/gcsim/GcsimStanceNormalAttack";
import type { GoConstant } from "#src/models/genshinAssets/kits/gcsim/GoConstant";
import type { GoValue } from "#src/models/genshinAssets/kits/gcsim/GoValue";

import { GcsimHitboxCenter } from "#src/models/genshinAssets/kits/gcsim/GcsimHitboxCenter";
import { GcsimHitboxShape } from "#src/models/genshinAssets/kits/gcsim/GcsimHitboxShape";
import { GcsimMultiplierKey } from "#src/models/genshinAssets/kits/gcsim/GcsimMultiplierKey";
import { GcsimTalentType } from "#src/models/genshinAssets/kits/gcsim/GcsimTalentType";
import { checkIsGoFloat } from "#src/services/genshinAssets/kits/gcsim/checkIsGoFloat";
import { findGcsimConstant } from "#src/services/genshinAssets/kits/gcsim/findGcsimConstant";
import { findGcsimHitbox } from "#src/services/genshinAssets/kits/gcsim/findGcsimHitbox";
import { findGcsimTalentLeaf } from "#src/services/genshinAssets/kits/gcsim/findGcsimTalentLeaf";
import { getGcsimLandingFrames } from "#src/services/genshinAssets/kits/gcsim/getGcsimLandingFrames";
import { readGoNumber } from "#src/services/genshinAssets/kits/gcsim/readGoNumber";
import { toGoNumbers } from "#src/services/genshinAssets/kits/gcsim/toGoNumbers";
import { STRIKE_TARGETING_AREA } from "genshin-world";

// A strike's frames from `attackFrames`, one per strike, or one list per state of the strikes, the first state's read
const readStrikeFrames = (value: GoValue | undefined, strikeIndex: number): GoValue | undefined => {
  if (!Array.isArray(value)) return undefined;
  const strikeList = Array.isArray(value[0]) ? value[0] : value;
  return strikeList[strikeIndex];
};

// A stance's strike box as gcsim's attack state gives it: a box round the body at that state's forward offset, from the
// State's list of boxes and the state's offset
const readStanceHitbox = (
  boxes: GoConstant | undefined,
  offsets: GoConstant | undefined,
  state: number,
  strikeIndex: number,
): GcsimHitbox | undefined => {
  if (boxes === undefined || offsets === undefined) return undefined;
  const stateBoxes = Array.isArray(boxes.value) ? boxes.value[state] : undefined;
  const [width, length] = toGoNumbers(Array.isArray(stateBoxes) ? stateBoxes[strikeIndex] : undefined) ?? [];
  const forward = readGoNumber(Array.isArray(offsets.value) ? offsets.value[state] : undefined);
  if (width === undefined || length === undefined || forward === undefined) return undefined;
  return {
    box: [width, length],
    center: GcsimHitboxCenter.Player,
    file: boxes.file,
    line: boxes.elementLines[state] ?? boxes.line,
    name: `N${strikeIndex + 1}`,
    offset: [0, forward],
    shape: GcsimHitboxShape.Box,
  };
};

// The normal attacks: each strike's hitmarks from `attackHitmarks` or the release list `attackReleases`, its animation
// From `attackFrames`, and its hits' areas from the `N<strike>` or `N<strike>-<hit>` hitboxes. A stance's normal attacks
// Are the same strikes at the path the stance names: each strike's box is the stance's attack state, and each hit's
// Multiplier is the normal attack's times the stance's skill factor, written as its own leaf
export const addGcsimNormalAttackCandidates = (
  { add, addHit, toFile }: GcsimKitCandidateWriter,
  { attacks, config, constantMap, travelMap }: GcsimCharacter,
  stance?: GcsimStanceNormalAttack,
): void => {
  const normalHitmarks = findGcsimConstant(constantMap, "attackHitmarks", "attackReleases");
  if (normalHitmarks === undefined || !Array.isArray(normalHitmarks.value)) return;
  const attack = attacks.find(({ talentVariable }) => talentVariable === "attack");
  const normalFrames = findGcsimConstant(constantMap, "attackFrames");
  const poiseVariable =
    attack?.poiseDamageVariable === undefined ? undefined : findGcsimConstant(constantMap, attack.poiseDamageVariable);
  const prefix = stance?.path ?? "normalAttacks";
  const stanceBoxes = stance === undefined ? undefined : findGcsimConstant(constantMap, "attackHitboxes");
  const stanceOffsets = stance === undefined ? undefined : findGcsimConstant(constantMap, "attackOffsets");
  add(`${prefix}.length`, normalHitmarks.value.length, toFile(normalHitmarks.file), normalHitmarks.line);
  for (const [strikeIndex, strikeHitmarks] of normalHitmarks.value.entries()) {
    const path = `${prefix}.${strikeIndex}`;
    const hitmarks = toGoNumbers(strikeHitmarks) ?? [];
    const hitmarkLine = normalHitmarks.elementLines[strikeIndex] ?? normalHitmarks.line;
    add(`${path}.hits.length`, hitmarks.length, toFile(normalHitmarks.file), hitmarkLine);
    const strikeFrames = readStrikeFrames(normalFrames?.value, strikeIndex);
    if (
      normalFrames !== undefined &&
      strikeFrames !== undefined &&
      !Array.isArray(strikeFrames) &&
      typeof strikeFrames === "object" &&
      !checkIsGoFloat(strikeFrames)
    )
      add(
        `${path}.animationFrames`,
        strikeFrames.animationFrames,
        toFile(normalFrames.file),
        normalFrames.elementLines[strikeIndex] ?? normalFrames.line,
      );
    const strikePoise = Array.isArray(poiseVariable?.value) ? poiseVariable.value[strikeIndex] : undefined;
    for (const [hitIndex, hitmark] of hitmarks.entries()) {
      const hitPoise = readGoNumber(Array.isArray(strikePoise) ? strikePoise[hitIndex] : strikePoise);
      const hitSource: GcsimHitSource = {
        attack,
        hitmark: {
          file: normalHitmarks.file,
          line: hitmarkLine,
          value: getGcsimLandingFrames(travelMap, normalHitmarks.name, hitmark),
        },
        ...(poiseVariable !== undefined &&
          typeof hitPoise === "number" && { poiseDamage: { line: poiseVariable.line, value: hitPoise } }),
      };
      const hitPath = `${path}.hits.${hitIndex}`;
      if (stance === undefined)
        addHit(
          hitPath,
          {
            ...hitSource,
            areaHitbox: findGcsimHitbox(config, "attack", `N${strikeIndex + 1}-${hitIndex + 1}`, `N${strikeIndex + 1}`),
            talentLeaf: findGcsimTalentLeaf(config, "attack", [strikeIndex, hitIndex]),
          },
          STRIKE_TARGETING_AREA,
        );
      else {
        addHit(
          hitPath,
          { ...hitSource, areaHitbox: readStanceHitbox(stanceBoxes, stanceOffsets, stance.state, strikeIndex) },
          STRIKE_TARGETING_AREA,
        );
        addHit(
          hitPath,
          {
            multiplierKey: GcsimMultiplierKey.Factor,
            talentLeaf: {
              path: [strikeIndex, hitIndex],
              reference: { label: stance.factorLabel, selector: 0, type: GcsimTalentType.Skill },
            },
          },
          STRIKE_TARGETING_AREA,
        );
      }
    }
  }
};
