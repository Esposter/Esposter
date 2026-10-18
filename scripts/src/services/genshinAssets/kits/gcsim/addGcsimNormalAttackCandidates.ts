import type { GcsimCharacter } from "#src/models/genshinAssets/kits/gcsim/GcsimCharacter";
import type { GcsimKitCandidateWriter } from "#src/models/genshinAssets/kits/gcsim/GcsimKitCandidateWriter";
import type { GoValue } from "#src/models/genshinAssets/kits/gcsim/GoValue";

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

// The normal attacks: each strike's hitmarks from `attackHitmarks` or the release list `attackReleases`, its animation
// From `attackFrames`, and its hits' areas from the `N<strike>` or `N<strike>-<hit>` hitboxes
export const addGcsimNormalAttackCandidates = (
  { add, addHit, toFile }: GcsimKitCandidateWriter,
  { attacks, config, constantMap, travelMap }: GcsimCharacter,
): void => {
  const normalHitmarks = findGcsimConstant(constantMap, "attackHitmarks", "attackReleases");
  if (normalHitmarks === undefined || !Array.isArray(normalHitmarks.value)) return;
  const attack = attacks.find(({ talentVariable }) => talentVariable === "attack");
  const normalFrames = findGcsimConstant(constantMap, "attackFrames");
  const poiseVariable =
    attack?.poiseDamageVariable === undefined ? undefined : findGcsimConstant(constantMap, attack.poiseDamageVariable);
  add("normalAttacks.length", normalHitmarks.value.length, toFile(normalHitmarks.file), normalHitmarks.line);
  for (const [strikeIndex, strikeHitmarks] of normalHitmarks.value.entries()) {
    const path = `normalAttacks.${strikeIndex}`;
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
      addHit(
        `${path}.hits.${hitIndex}`,
        {
          areaHitbox: findGcsimHitbox(config, "attack", `N${strikeIndex + 1}-${hitIndex + 1}`, `N${strikeIndex + 1}`),
          attack,
          hitmark: {
            file: normalHitmarks.file,
            line: hitmarkLine,
            value: getGcsimLandingFrames(travelMap, normalHitmarks.name, hitmark),
          },
          ...(poiseVariable !== undefined &&
            typeof hitPoise === "number" && { poiseDamage: { line: poiseVariable.line, value: hitPoise } }),
          talentLeaf: findGcsimTalentLeaf(config, "attack", [strikeIndex, hitIndex]),
        },
        STRIKE_TARGETING_AREA,
      );
    }
  }
};
