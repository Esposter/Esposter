import type { GcsimCharacter } from "#src/models/genshinAssets/kits/gcsim/GcsimCharacter";
import type { GcsimHoldSource } from "#src/models/genshinAssets/kits/gcsim/GcsimHoldSource";
import type { GcsimKitCandidateWriter } from "#src/models/genshinAssets/kits/gcsim/GcsimKitCandidateWriter";

import {
  GCSIM_FRAMES_PER_SECOND,
  GCSIM_SKILL_HOLD_HITBOX_NAME,
  GCSIM_SKILL_HOLD_PREFIXES,
} from "#src/services/genshinAssets/kits/constants";
import { findGcsimConstant } from "#src/services/genshinAssets/kits/gcsim/findGcsimConstant";
import { findGcsimHitbox } from "#src/services/genshinAssets/kits/gcsim/findGcsimHitbox";
import { findGcsimTalentLeaf } from "#src/services/genshinAssets/kits/gcsim/findGcsimTalentLeaf";
import { getGcsimLandingFrames } from "#src/services/genshinAssets/kits/gcsim/getGcsimLandingFrames";
import { findQueuedAttack } from "#src/services/genshinAssets/kits/gcsim/getGcsimQueuedHits";
import { readGoNumber } from "#src/services/genshinAssets/kits/gcsim/readGoNumber";
import { toGoNumbers } from "#src/services/genshinAssets/kits/gcsim/toGoNumbers";
import { SKILL_TARGETING_AREA } from "genshin-world";

// The skill's holds: one for each of the short hold and the hold gcsim gives frames or hitmarks for, the shorter first,
// Or one for each level its `<hold>Hitmarks` lists, each with its frames from `<hold>Frames`, its hit from
// `<hold>Hitmark` and its area from the `E-Hold` hitbox. A hold's `Hitmarks` listing numbers is its hitmark in each
// State gcsim reads it at, so it gives no hits
export const addGcsimSkillHoldCandidates = (
  { add, addFrames, addHit, toFile }: GcsimKitCandidateWriter,
  { attacks, config, constantMap, holdCooldowns, queuedAttacks, travelMap }: GcsimCharacter,
): void => {
  const holds = GCSIM_SKILL_HOLD_PREFIXES.flatMap((prefix): GcsimHoldSource[] => {
    const hitmarks = findGcsimConstant(constantMap, `${prefix}Hitmarks`, `${prefix}Hitmark`);
    const framesName = `${prefix}Frames`;
    const levelHitmarks = Array.isArray(hitmarks?.value) ? hitmarks.value.filter((level) => Array.isArray(level)) : [];
    if (hitmarks !== undefined && levelHitmarks.length > 0)
      return levelHitmarks.map((level, levelIndex) => ({
        framesName,
        hitmarks: { ...hitmarks, line: hitmarks.elementLines[levelIndex] ?? hitmarks.line, values: toGoNumbers(level) },
      }));
    const hitmarkValue = readGoNumber(hitmarks?.value);
    const hitmarkValues = hitmarkValue === undefined ? undefined : [hitmarkValue];
    if (hitmarks === undefined && !constantMap.has(framesName)) return [];
    return [{ framesName, ...(hitmarks !== undefined && { hitmarks: { ...hitmarks, values: hitmarkValues } }) }];
  });
  const [firstHold] = holds;
  const holdsConstant =
    firstHold?.hitmarks ??
    findGcsimConstant(constantMap, ...GCSIM_SKILL_HOLD_PREFIXES.map((prefix) => `${prefix}Frames`));
  if (holdsConstant !== undefined)
    add("skillHolds.length", holds.length, toFile(holdsConstant.file), holdsConstant.line);
  for (const [holdIndex, { framesName, hitmarks }] of holds.entries()) {
    const path = `skillHolds.${holdIndex}.action`;
    if (framesName !== undefined) addFrames(`${path}.animationFrames`, framesName);
    if (hitmarks?.values === undefined) continue;
    add(`${path}.hits.length`, hitmarks.values.length, toFile(hitmarks.file), hitmarks.line);
    for (const [hitIndex, hitmark] of hitmarks.values.entries()) {
      // The hold's attack and area are the one call firing at its hitmark, if one call alone does
      const firedCalls = queuedAttacks.filter(({ delay, file }) => file === hitmarks.file && delay === hitmark);
      const [firedCall] = firedCalls;
      const isFiredAlone = firedCalls.length === 1;
      const firedAttack = isFiredAlone && firedCall !== undefined ? findQueuedAttack(attacks, firedCall) : undefined;
      addHit(
        `${path}.hits.${hitIndex}`,
        {
          areaHitbox:
            (isFiredAlone ? firedCall?.hitbox : undefined) ??
            (hitmarks.values.length === 1 ? findGcsimHitbox(config, "skill", GCSIM_SKILL_HOLD_HITBOX_NAME) : undefined),
          attack: firedAttack,
          hitmark: {
            file: hitmarks.file,
            line: hitmarks.line,
            value: getGcsimLandingFrames(travelMap, hitmarks.name, hitmark),
          },
          talentLeaf:
            firedAttack === undefined ? undefined : findGcsimTalentLeaf(config, firedAttack.talentVariable, [hitIndex]),
        },
        SKILL_TARGETING_AREA,
      );
    }
  }
  // A case of the hold's switch sets the cooldown the skill takes, in frames, which the table gives in seconds
  for (const [holdIndex, { file, frames, line }] of holdCooldowns.entries())
    add(`skillHolds.${holdIndex}.cooldownSeconds`, frames / GCSIM_FRAMES_PER_SECOND, toFile(file), line);
};
