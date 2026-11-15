// The three combat talents a character levels: its normal attack, its Elemental Skill and its Elemental Burst
export const CombatTalent = {
  ElementalBurst: "ElementalBurst",
  ElementalSkill: "ElementalSkill",
  NormalAttack: "NormalAttack",
} as const;
export type CombatTalent = (typeof CombatTalent)[keyof typeof CombatTalent];
