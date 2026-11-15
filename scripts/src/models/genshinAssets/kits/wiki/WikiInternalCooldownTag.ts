export const WikiInternalCooldownTag = {
  ChargedAttack: "Charged Attack",
  ElementalBurst: "Elemental Burst",
  ElementalSkill: "Elemental Skill",
  NormalAttack: "Normal Attack",
  VesnaElementalSkillStart: "Vesna Elemental Skill Start",
} as const;
export type WikiInternalCooldownTag = (typeof WikiInternalCooldownTag)[keyof typeof WikiInternalCooldownTag];
