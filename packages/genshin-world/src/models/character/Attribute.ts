// What a character's attributes are summed from, each spelt as the game's tables name it, so a table read from the game
// Parses into them. A base is what its percentage multiplies, and its flat attribute is added after; every other is a
// Total of its own, a percentage kept as a fraction
export enum Attribute {
  AnemoDamageBonus = "FIGHT_PROP_WIND_ADD_HURT",
  AnemoResistance = "FIGHT_PROP_WIND_SUB_HURT",
  Attack = "FIGHT_PROP_ATTACK",
  AttackPercent = "FIGHT_PROP_ATTACK_PERCENT",
  BaseAttack = "FIGHT_PROP_BASE_ATTACK",
  BaseDefense = "FIGHT_PROP_BASE_DEFENSE",
  BaseHealth = "FIGHT_PROP_BASE_HP",
  CriticalDamage = "FIGHT_PROP_CRITICAL_HURT",
  CriticalRate = "FIGHT_PROP_CRITICAL",
  CryoDamageBonus = "FIGHT_PROP_ICE_ADD_HURT",
  CryoResistance = "FIGHT_PROP_ICE_SUB_HURT",
  Defense = "FIGHT_PROP_DEFENSE",
  DefensePercent = "FIGHT_PROP_DEFENSE_PERCENT",
  DendroDamageBonus = "FIGHT_PROP_GRASS_ADD_HURT",
  DendroResistance = "FIGHT_PROP_GRASS_SUB_HURT",
  ElectroDamageBonus = "FIGHT_PROP_ELEC_ADD_HURT",
  ElectroResistance = "FIGHT_PROP_ELEC_SUB_HURT",
  ElementalMastery = "FIGHT_PROP_ELEMENT_MASTERY",
  EnergyRecharge = "FIGHT_PROP_CHARGE_EFFICIENCY",
  GeoDamageBonus = "FIGHT_PROP_ROCK_ADD_HURT",
  GeoResistance = "FIGHT_PROP_ROCK_SUB_HURT",
  HealingBonus = "FIGHT_PROP_HEAL_ADD",
  Health = "FIGHT_PROP_HP",
  HealthPercent = "FIGHT_PROP_HP_PERCENT",
  HydroDamageBonus = "FIGHT_PROP_WATER_ADD_HURT",
  HydroResistance = "FIGHT_PROP_WATER_SUB_HURT",
  IncomingHealingBonus = "FIGHT_PROP_HEALED_ADD",
  PhysicalDamageBonus = "FIGHT_PROP_PHYSICAL_ADD_HURT",
  PhysicalResistance = "FIGHT_PROP_PHYSICAL_SUB_HURT",
  PyroDamageBonus = "FIGHT_PROP_FIRE_ADD_HURT",
  PyroResistance = "FIGHT_PROP_FIRE_SUB_HURT",
  ShieldStrength = "FIGHT_PROP_SHIELD_COST_MINUS_RATIO",
}

export const Attributes: readonly Attribute[] = Object.values(Attribute);
