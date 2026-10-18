import type { GcsimCharacter } from "#src/models/genshinAssets/kits/gcsim/GcsimCharacter";
import type { GcsimKitCandidateWriter } from "#src/models/genshinAssets/kits/gcsim/GcsimKitCandidateWriter";
import type { GoValue } from "#src/models/genshinAssets/kits/gcsim/GoValue";

import { checkIsGoFloat } from "#src/services/genshinAssets/kits/gcsim/checkIsGoFloat";
import { findGcsimConstant } from "#src/services/genshinAssets/kits/gcsim/findGcsimConstant";
import { findGcsimTalentLeaf } from "#src/services/genshinAssets/kits/gcsim/findGcsimTalentLeaf";
import { readGoNumber } from "#src/services/genshinAssets/kits/gcsim/readGoNumber";
import { SKILL_TARGETING_AREA } from "genshin-world";

// A frames constant's animation length, where the constant is one set of frames
const readAnimationFrames = (value: GoValue | undefined): number | undefined =>
  typeof value === "object" && !Array.isArray(value) && !checkIsGoFloat(value) ? value.animationFrames : undefined;

// Varesa's Fiery Passion: the stance's skill is the rush at the skill's frames and hitmark, its multiplier the Fiery
// Passion rush's, and the burst variant is the flying kick at the burst's frames and hitmark, its multiplier the Fiery
// Passion kick's. Neither area is read: both are built in code as a box and a circle, not as a hitbox of the config. The
// Rush's area (skill.go:82), the kick's area (burst.go:76) and the kick's Fiery Passion poise (burst.go:70) are the
// Overlay's values, the code's own numbers where the reader cannot see a branch's literal
export const addGcsimFieryPassionCandidates = (
  { add, addHit, toFile }: GcsimKitCandidateWriter,
  { attacks, config, constantMap }: GcsimCharacter,
): void => {
  const rush = attacks.find(({ talentVariable }) => talentVariable === "rush");
  const kick = attacks.find(({ talentVariable }) => talentVariable === "kick");
  const skillFrames = findGcsimConstant(constantMap, "fierySkillFrames");
  const skillHitmark = findGcsimConstant(constantMap, "fierySkillHitmark");
  const burstFrames = findGcsimConstant(constantMap, "burstFrames");
  const burstHitmark = findGcsimConstant(constantMap, "burstHitmark");
  const skillAnimation = readAnimationFrames(skillFrames?.value);
  const skillHitmarkValue = readGoNumber(skillHitmark?.value);
  if (
    rush !== undefined &&
    skillFrames !== undefined &&
    skillAnimation !== undefined &&
    skillHitmark !== undefined &&
    skillHitmarkValue !== undefined
  ) {
    add("stances.fieryPassion.skill.animationFrames", skillAnimation, toFile(skillFrames.file), skillFrames.line);
    add("stances.fieryPassion.skill.hits.length", 1, toFile(skillHitmark.file), skillHitmark.line);
    addHit(
      "stances.fieryPassion.skill.hits.0",
      {
        attack: rush,
        hitmark: { file: skillHitmark.file, line: skillHitmark.line, value: skillHitmarkValue },
        talentLeaf: findGcsimTalentLeaf(config, "fieryRush", []),
      },
      SKILL_TARGETING_AREA,
    );
  }
  const burstAnimation = readAnimationFrames(burstFrames?.value);
  const burstHitmarkValue = readGoNumber(burstHitmark?.value);
  if (
    kick !== undefined &&
    burstFrames !== undefined &&
    burstAnimation !== undefined &&
    burstHitmark !== undefined &&
    burstHitmarkValue !== undefined
  ) {
    add("burstVariant.animationFrames", burstAnimation, toFile(burstFrames.file), burstFrames.line);
    add("burstVariant.hits.length", 1, toFile(burstHitmark.file), burstHitmark.line);
    addHit(
      "burstVariant.hits.0",
      {
        attack: kick,
        hitmark: { file: burstHitmark.file, line: burstHitmark.line, value: burstHitmarkValue },
        talentLeaf: findGcsimTalentLeaf(config, "fieryKick", []),
      },
      SKILL_TARGETING_AREA,
    );
  }
};
