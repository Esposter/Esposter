import { invalidRead } from "#src/services/genshinAssets/gcg/invalidRead";
import { GcgSkillKind } from "genshin-world";

// The skill tag the card gives a skill: A for a normal attack, E for an elemental skill, Q for a burst, and PASSIVE for a
// Passive the character holds
export const toSkillKind = (skillTags: string[]): GcgSkillKind => {
  if (skillTags.includes("GCG_SKILL_TAG_A")) return GcgSkillKind.NormalAttack;
  else if (skillTags.includes("GCG_SKILL_TAG_E")) return GcgSkillKind.ElementalSkill;
  else if (skillTags.includes("GCG_SKILL_TAG_Q")) return GcgSkillKind.ElementalBurst;
  else if (skillTags.includes("GCG_SKILL_TAG_PASSIVE")) return GcgSkillKind.Passive;
  throw invalidRead(`a skill names no kind in ${skillTags.join(", ")}`);
};
