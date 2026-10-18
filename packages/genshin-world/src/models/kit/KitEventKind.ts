// What a kit event tells the deployed team's kits: a member used its Elemental Burst, another character came on the
// Field, an enemy took a hit's damage, a hit applied an element to an enemy, an effect on the team ran out, particles
// Or orbs reached the party, a kit refused a member's fall, a member's HP changed, the character on the field picked up
// Mora or opened a chest in the world, a normal attack of the character on the field started or landed, a hit triggered
// Reactions on an enemy, a status on an enemy struck on its own schedule, a taunt took an enemy's strike, or a shield
// Took a strike on a party member for its owner. A charged attack of the character on the field landed, a skill was
// Used, a hit of an element or on a weak point landed on an enemy, or a hit defeated one, or a hit felled an animal in
// The world
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
  FallRefused = "FallRefused",
  HealthChanged = "HealthChanged",
  MoraPickedUp = "MoraPickedUp",
  NightsoulPointsConsumed = "NightsoulPointsConsumed",
  NormalAttackLanded = "NormalAttackLanded",
  NormalAttackStarted = "NormalAttackStarted",
  ReactionTriggered = "ReactionTriggered",
  ShieldAbsorbed = "ShieldAbsorbed",
  SkillUsed = "SkillUsed",
  StatusTicked = "StatusTicked",
  TauntDamaged = "TauntDamaged",
  WeakPointHit = "WeakPointHit",
  WildlifeStruck = "WildlifeStruck",
}
