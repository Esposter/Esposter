// What a kit event tells the deployed team's kits: a member used its Elemental Burst, another character came on the
// Field, an enemy took a hit's damage, an effect on the team ran out, particles or orbs reached the party, a member's
// HP changed, the character on the field picked up Mora or opened a chest in the world, a normal attack of the
// Character on the field landed, a hit triggered reactions on an enemy, a status on an enemy struck on its own
// Schedule, or a taunt took an enemy's strike. A charged attack of the character on the field landed, a skill was
// Used, a hit of an element or on a weak point landed on an enemy, or a hit defeated one
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
  SkillUsed = "SkillUsed",
  StatusTicked = "StatusTicked",
  TauntDamaged = "TauntDamaged",
  WeakPointHit = "WeakPointHit",
}
