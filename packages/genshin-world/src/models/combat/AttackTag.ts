// The kind of attack a hit is dealt as, which a passive, a status or a constellation answering only some of them reads:
// A normal attack, a charged attack, a plunge, an elemental skill or an elemental burst
export const AttackTag = {
  ChargedAttack: "ChargedAttack",
  ElementalBurst: "ElementalBurst",
  ElementalSkill: "ElementalSkill",
  NormalAttack: "NormalAttack",
  PlungingAttack: "PlungingAttack",
} as const;
export type AttackTag = (typeof AttackTag)[keyof typeof AttackTag];
