import type { GcsimCharacter } from "#src/models/genshinAssets/kits/gcsim/GcsimCharacter";
import type { GcsimHitSource } from "#src/models/genshinAssets/kits/gcsim/GcsimHitSource";
import type { GcsimKitCandidateWriter } from "#src/models/genshinAssets/kits/gcsim/GcsimKitCandidateWriter";
import type { GcsimStanceNormalAttack } from "#src/models/genshinAssets/kits/gcsim/GcsimStanceNormalAttack";

import { GcsimMultiplierKey } from "#src/models/genshinAssets/kits/gcsim/GcsimMultiplierKey";
import { GcsimTalentType } from "#src/models/genshinAssets/kits/gcsim/GcsimTalentType";
import { KIT_LENGTH_KEY } from "#src/services/genshinAssets/kits/constants";
import { checkIsGoFloat } from "#src/services/genshinAssets/kits/gcsim/checkIsGoFloat";
import { findGcsimConstant } from "#src/services/genshinAssets/kits/gcsim/findGcsimConstant";
import { findGcsimHitbox } from "#src/services/genshinAssets/kits/gcsim/findGcsimHitbox";
import { findGcsimTalentLeaf } from "#src/services/genshinAssets/kits/gcsim/findGcsimTalentLeaf";
import { getGcsimLandingFrames } from "#src/services/genshinAssets/kits/gcsim/getGcsimLandingFrames";
import { readGoNumber } from "#src/services/genshinAssets/kits/gcsim/readGoNumber";
import { readStanceHitbox } from "#src/services/genshinAssets/kits/gcsim/readStanceHitbox";
import { readStrikeFrames } from "#src/services/genshinAssets/kits/gcsim/readStrikeFrames";
import { toGoNumbers } from "#src/services/genshinAssets/kits/gcsim/toGoNumbers";
import { STRIKE_TARGETING_AREA } from "genshin-world";

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
  add(`${prefix}.${KIT_LENGTH_KEY}`, normalHitmarks.value.length, toFile(normalHitmarks.file), normalHitmarks.line);
  for (const [strikeIndex, strikeHitmarks] of normalHitmarks.value.entries()) {
    const path = `${prefix}.${strikeIndex}`;
    const hitmarks = toGoNumbers(strikeHitmarks) ?? [];
    const hitmarkLine = normalHitmarks.elementLines[strikeIndex] ?? normalHitmarks.line;
    add(`${path}.hits.${KIT_LENGTH_KEY}`, hitmarks.length, toFile(normalHitmarks.file), hitmarkLine);
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
