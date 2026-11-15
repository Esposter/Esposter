export const InfoboxTypeCombatTalent = {
  ElementalBurst: "Elemental Burst",
  ElementalSkill: "Elemental Skill",
  NormalAttack: "Normal Attack",
} as const;
export type InfoboxTypeCombatTalent = (typeof InfoboxTypeCombatTalent)[keyof typeof InfoboxTypeCombatTalent];
