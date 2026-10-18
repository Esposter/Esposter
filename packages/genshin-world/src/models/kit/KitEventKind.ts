// What a kit event tells the deployed team's kits: a member used its Elemental Burst, another character came on the
// Field, an enemy took a hit's damage, an effect on the team ran out, particles or orbs reached the party, a member's
// HP changed, the character on the field picked up Mora or opened a chest in the world, a normal attack of the
// Character on the field landed, a hit triggered reactions on an enemy, a status on an enemy struck on its own
// Schedule, a taunt took an enemy's strike, or a shield took a strike on a party member for its owner. A charged attack
// Of the character on the field landed, a skill was used, a hit of an element or on a weak point landed on an enemy, or
// A hit defeated one
export enum KitEventKind {
  BurstUsed = "BurstUsed",
  CharacterSwapped = "CharacterSwapped",
  ChargedAttackLanded = "ChargedAttackLanded",
  ChestOpened = "ChestOpened",
  DamageTaken = "DamageTaken",
  EffectExpired = "EffectExpired",
  ElementalHit = "ElementalHit",
  EnemyDefeated = "EnemyDefeated",
  EnergyParticleCollected = "EnergyParticleCollected",
  HealthChanged = "HealthChanged",
  MoraPickedUp = "MoraPickedUp",
  NormalAttackLanded = "NormalAttackLanded",
  ReactionTriggered = "ReactionTriggered",
  ShieldAbsorbed = "ShieldAbsorbed",
  SkillUsed = "SkillUsed",
  StatusTicked = "StatusTicked",
  TauntDamaged = "TauntDamaged",
  WeakPointHit = "WeakPointHit",
}
