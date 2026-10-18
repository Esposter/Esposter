// What a kit event tells the deployed team's kits: a member used its Elemental Burst, another character came on the
// Field. An enemy took a hit's damage, a hit applied an element to an enemy, an effect on the team ran out, particles or
// Orbs reached the party, a member's HP changed, the character on the field picked up Mora or opened a chest in the world,
// A normal attack of the character on the field landed, a hit triggered reactions on an enemy, a status on an enemy struck
// On its own schedule, a taunt took an enemy's strike, or a shield took a strike on a party member for its owner. A charged
// Attack of the character on the field landed, a skill was used, a hit of an element or on a weak point landed on an enemy,
// Or a hit defeated one, a hit felled an animal in the world, or a Nightsoul blessing drained a character's points
export enum KitEventKind {
  BurstUsed = "BurstUsed",
  CharacterSwapped = "CharacterSwapped",
  ChargedAttackLanded = "ChargedAttackLanded",
  ChestOpened = "ChestOpened",
  DamageTaken = "DamageTaken",
  ElementApplied = "ElementApplied",
  EffectExpired = "EffectExpired",
  ElementalHit = "ElementalHit",
  EnemyDefeated = "EnemyDefeated",
  EnergyParticleCollected = "EnergyParticleCollected",
  HealthChanged = "HealthChanged",
  MoraPickedUp = "MoraPickedUp",
  NightsoulPointsConsumed = "NightsoulPointsConsumed",
  NormalAttackLanded = "NormalAttackLanded",
  ReactionTriggered = "ReactionTriggered",
  ShieldAbsorbed = "ShieldAbsorbed",
  SkillUsed = "SkillUsed",
  StatusTicked = "StatusTicked",
  TauntDamaged = "TauntDamaged",
  WeakPointHit = "WeakPointHit",
  WildlifeStruck = "WildlifeStruck",
}
