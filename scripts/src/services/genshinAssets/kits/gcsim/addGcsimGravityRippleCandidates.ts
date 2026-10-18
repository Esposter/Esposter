import type { GcsimAttack } from "#src/models/genshinAssets/kits/gcsim/GcsimAttack";
import type { GcsimCharacter } from "#src/models/genshinAssets/kits/gcsim/GcsimCharacter";
import type { GcsimKitCandidateWriter } from "#src/models/genshinAssets/kits/gcsim/GcsimKitCandidateWriter";

import { findGcsimConstant } from "#src/services/genshinAssets/kits/gcsim/findGcsimConstant";
import { findGcsimHitbox } from "#src/services/genshinAssets/kits/gcsim/findGcsimHitbox";
import { findGcsimTalentLeaf } from "#src/services/genshinAssets/kits/gcsim/findGcsimTalentLeaf";
import { toGoNumbers } from "#src/services/genshinAssets/kits/gcsim/toGoNumbers";
import { STRIKE_TARGETING_AREA } from "genshin-world";

// Each reaction's record path and the config's hitbox name for its ripple, which is a circle round the primary target
const RIPPLE_TARGETS = new Map([
  ["LunarBloom", { hitboxName: "E-Gravity-LB", path: "hits.gravityRippleLunarBloom" }],
  ["LunarCharge", { hitboxName: "E-Gravity-LC", path: "hits.gravityRippleLunarCharged" }],
  ["LunarCrystallize", { hitboxName: "E-Gravity-LCr", path: "hits.gravityRippleLunarCrystallize" }],
]);

// Gravity Ripple's hits, one per reaction the gravity tick fires: each reaction's hitmarks from the constant its switch
// Case names, the bloom's travel added to each, and a ripple of several hits written as a list the record reads by index.
// Its literal sets no PoiseDMG, so it deals none, as a named hit without poise does
export const addGcsimGravityRippleCandidates = (
  { add, addHit, addNoPoiseRule, toFile }: GcsimKitCandidateWriter,
  { config, constantMap, gravityRipples = [] }: GcsimCharacter,
): void => {
  for (const ripple of gravityRipples) {
    const target = RIPPLE_TARGETS.get(ripple.reaction);
    const hitmarks = findGcsimConstant(constantMap, ripple.hitmarkName);
    const hitmarkValues = toGoNumbers(hitmarks?.value);
    if (target === undefined || hitmarks === undefined || hitmarkValues === undefined) continue;
    const travelFrames = toGoNumbers(findGcsimConstant(constantMap, ripple.travelName ?? "")?.value)?.[0] ?? 0;
    const attack: GcsimAttack = {
      abil: ripple.abil,
      element: ripple.element,
      fieldLineMap: {},
      file: ripple.file,
      line: ripple.line,
      siteLine: ripple.line,
      talentVariable: ripple.talentVariable,
    };
    const areaHitbox = findGcsimHitbox(config, "skill", target.hitboxName);
    const talentLeaf = findGcsimTalentLeaf(config, ripple.talentVariable, []);
    const isList = hitmarkValues.length > 1;
    if (isList) add(`${target.path}.length`, hitmarkValues.length, toFile(hitmarks.file), hitmarks.line);
    for (const [hitIndex, hitmark] of hitmarkValues.entries()) {
      const path = isList ? `${target.path}.${hitIndex}` : target.path;
      addHit(
        path,
        {
          areaHitbox,
          attack,
          hitmark: { file: hitmarks.file, line: hitmarks.line, value: hitmark + travelFrames },
          talentLeaf,
        },
        STRIKE_TARGETING_AREA,
      );
      addNoPoiseRule(`${path}.poiseDamage`);
    }
  }
};
