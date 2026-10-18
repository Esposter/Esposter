// The kind of hit an internal cooldown counts, so a character's normal attacks, skill and burst each keep their own, and
// A summon or a strike gcsim gives a tag of its own keeps its own beside them
export enum InternalCooldownTag {
  ChargedAttack = "ChargedAttack",
  ElementalBurst = "ElementalBurst",
  ElementalSkill = "ElementalSkill",
  FurinaChevalmarin = "FurinaChevalmarin",
  FurinaUsher = "FurinaUsher",
  KleePyroDamage = "KleePyroDamage",
  LisaElectroDamage = "LisaElectroDamage",
  MonaHydroDamage = "MonaHydroDamage",
  NormalAttack = "NormalAttack",
  TartagliaFoulLegacy = "TartagliaFoulLegacy",
  TartagliaRiptide = "TartagliaRiptide",
  VaresaCombatCycle = "VaresaCombatCycle",
  VesnaElementalSkillStart = "VesnaElementalSkillStart",
}
