// The kind of hit an internal cooldown counts, so a character's normal attacks, skill and burst each keep their own
export enum InternalCooldownTag {
  ChargedAttack = "ChargedAttack",
  ElementalBurst = "ElementalBurst",
  ElementalSkill = "ElementalSkill",
  MonaHydroDamage = "MonaHydroDamage",
  NormalAttack = "NormalAttack",
}
