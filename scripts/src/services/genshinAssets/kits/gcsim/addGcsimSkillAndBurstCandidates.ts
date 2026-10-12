import type { GcsimCharacter } from "#src/models/genshinAssets/kits/gcsim/GcsimCharacter";
import type { GcsimKitCandidateWriter } from "#src/models/genshinAssets/kits/gcsim/GcsimKitCandidateWriter";

import {
  GCSIM_BURST_ATTACK_TAGS,
  GCSIM_SKILL_ATTACK_TAGS,
  GCSIM_SKILL_PRESS_HITBOX_NAMES,
} from "#src/services/genshinAssets/kits/constants";
import { addGcsimQueuedHits } from "#src/services/genshinAssets/kits/gcsim/addGcsimQueuedHits";
import { findGcsimConstant } from "#src/services/genshinAssets/kits/gcsim/findGcsimConstant";
import { findGcsimHitbox } from "#src/services/genshinAssets/kits/gcsim/findGcsimHitbox";
import { findGcsimTalentLeaf } from "#src/services/genshinAssets/kits/gcsim/findGcsimTalentLeaf";
import { getGcsimLandingFrames } from "#src/services/genshinAssets/kits/gcsim/getGcsimLandingFrames";
import { toGoNumbers } from "#src/services/genshinAssets/kits/gcsim/toGoNumbers";
import { SKILL_TARGETING_AREA } from "genshin-world";

// The skill and burst: their hitmarks from `<slot>Hitmark` or `<slot>Hitmarks`, or the skill's press's or tap's,
// Their frames from `<slot>Frames` or the press's or tap's, and each hit by its place among the slot's talent
// Multipliers and the ability's hitboxes, where they are as many as its hitmarks. A skill of one hit with no hitbox for
// Each takes the `E-Tap` or `E-Press` hitbox. A press's `Hitmarks` listing numbers is its hitmark in each state gcsim
// Reads it at, so it gives no hits. A burst with no attack under its tag is a buff, a heal or a drain, and gives none. A
// slot with no hitmark constant is hit by its queue calls, each at its damage delay, through `addGcsimQueuedHits`
export const addGcsimSkillAndBurstCandidates = (writer: GcsimKitCandidateWriter, gcsim: GcsimCharacter): void => {
  const { add, addFrames, addHit, toFile } = writer;
  const { attacks, config, constantMap, travelMap } = gcsim;
  for (const [slot, attackTags, pressNames, pressHitboxNames] of [
    ["skill", GCSIM_SKILL_ATTACK_TAGS, ["skillPress", "skillTap"], GCSIM_SKILL_PRESS_HITBOX_NAMES],
    ["burst", GCSIM_BURST_ATTACK_TAGS, [], []],
  ] as const) {
    addFrames(`${slot}.animationFrames`, `${slot}Frames`, ...pressNames.map((pressName) => `${pressName}Frames`));
    const hitmarks = findGcsimConstant(
      constantMap,
      `${slot}Hitmarks`,
      `${slot}Hitmark`,
      ...pressNames.flatMap((pressName) => [`${pressName}Hitmarks`, `${pressName}Hitmark`]),
    );
    const hitmarkValues = toGoNumbers(hitmarks?.value);
    const isPressStateList =
      Array.isArray(hitmarks?.value) && pressNames.some((pressName) => hitmarks.name === `${pressName}Hitmarks`);
    const slotAttacks = attacks.filter(({ attackTag }) => attackTag !== undefined && attackTags.includes(attackTag));
    if (slot === "burst" && hitmarks === undefined && slotAttacks.length === 0) {
      const burstFrames = findGcsimConstant(constantMap, "burstFrames");
      if (burstFrames !== undefined) add("burst.hits.length", 0, toFile(burstFrames.file), burstFrames.line);
      continue;
    }
    if (hitmarks === undefined) {
      addGcsimQueuedHits(writer, gcsim, {
        abilityName: slot,
        attackTags,
        framesName: `${slot}Frames`,
        path: slot,
        targetingArea: SKILL_TARGETING_AREA,
      });
      continue;
    }
    if (hitmarkValues === undefined || isPressStateList) continue;
    const slotLeaves = [...new Set(slotAttacks.map(({ talentVariable }) => talentVariable))].flatMap(
      (variable) => config.talentVariables.find(({ name }) => name === variable)?.leaves ?? [],
    );
    // A hit is joined to a multiplier and a hitbox by its place only where the slot has one of each for every hitmark
    const isLeafJoined = slotLeaves.length === hitmarkValues.length;
    const hitboxes = config.abilityHitboxesMap.get(slot) ?? [];
    const isHitboxJoined = hitboxes.length === hitmarkValues.length;
    add(`${slot}.hits.length`, hitmarkValues.length, toFile(hitmarks.file), hitmarks.line);
    for (const [hitIndex, hitmark] of hitmarkValues.entries()) {
      const talentLeaf = isLeafJoined ? slotLeaves[hitIndex] : undefined;
      const variable =
        talentLeaf === undefined
          ? undefined
          : config.talentVariables.find(({ leaves }) => leaves.includes(talentLeaf))?.name;
      addHit(
        `${slot}.hits.${hitIndex}`,
        {
          areaHitbox: isHitboxJoined
            ? hitboxes[hitIndex]
            : hitmarkValues.length === 1
              ? findGcsimHitbox(config, slot, ...pressHitboxNames)
              : undefined,
          attack: slotAttacks.find(({ talentVariable }) => talentVariable === variable),
          hitmark: {
            file: hitmarks.file,
            line: hitmarks.elementLines[hitIndex] ?? hitmarks.line,
            value: getGcsimLandingFrames(travelMap, hitmarks.name, hitmark),
          },
          talentLeaf,
        },
        SKILL_TARGETING_AREA,
      );
    }
  }
};
