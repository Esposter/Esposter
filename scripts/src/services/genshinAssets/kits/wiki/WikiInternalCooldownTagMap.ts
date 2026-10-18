import { InternalCooldownTag } from "genshin-world";

// The wiki's ICD tags as its Advanced Properties write them, as the kit names the ones it holds
export const WikiInternalCooldownTagMap: Partial<Record<string, InternalCooldownTag>> = {
  "Charged Attack": InternalCooldownTag.ChargedAttack,
  "Elemental Burst": InternalCooldownTag.ElementalBurst,
  "Elemental Skill": InternalCooldownTag.ElementalSkill,
  "Normal Attack": InternalCooldownTag.NormalAttack,
  "Vesna Elemental Skill Start": InternalCooldownTag.VesnaElementalSkillStart,
};
