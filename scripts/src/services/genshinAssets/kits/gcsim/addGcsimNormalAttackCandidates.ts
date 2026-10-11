import type { GcsimCharacter } from "#src/models/genshinAssets/kits/gcsim/GcsimCharacter";
import type { GcsimKitCandidateWriter } from "#src/models/genshinAssets/kits/gcsim/GcsimKitCandidateWriter";

import { findGcsimConstant } from "#src/services/genshinAssets/kits/gcsim/findGcsimConstant";
import { findGcsimHitbox } from "#src/services/genshinAssets/kits/gcsim/findGcsimHitbox";
import { findGcsimTalentLeaf } from "#src/services/genshinAssets/kits/gcsim/findGcsimTalentLeaf";
import { getGcsimLandingFrames } from "#src/services/genshinAssets/kits/gcsim/getGcsimLandingFrames";
import { toGoNumbers } from "#src/services/genshinAssets/kits/gcsim/toGoNumbers";
import { STRIKE_TARGETING_AREA } from "genshin-world";

// The normal attacks: each strike's hitmarks from `attackHitmarks`, its animation from `attackFrames`, and its hits'
// Areas from the `N<strike>` or `N<strike>-<hit>` hitboxes
export const addGcsimNormalAttackCandidates = (
  { add, addHit, toFile }: GcsimKitCandidateWriter,
  { attacks, config, constantMap, travelMap }: GcsimCharacter,
): void => {
  const normalHitmarks = findGcsimConstant(constantMap, "attackHitmarks");
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
    const strikeFrames = Array.isArray(normalFrames?.value) ? normalFrames.value[strikeIndex] : undefined;
    if (
      normalFrames !== undefined &&
      strikeFrames !== undefined &&
      !Array.isArray(strikeFrames) &&
      typeof strikeFrames === "object"
    )
      add(
        `${path}.animationFrames`,
        strikeFrames.animationFrames,
        toFile(normalFrames.file),
        normalFrames.elementLines[strikeIndex] ?? normalFrames.line,
      );
    const strikePoise = Array.isArray(poiseVariable?.value) ? poiseVariable.value[strikeIndex] : undefined;
    for (const [hitIndex, hitmark] of hitmarks.entries()) {
      const hitPoise = Array.isArray(strikePoise) ? strikePoise[hitIndex] : strikePoise;
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
