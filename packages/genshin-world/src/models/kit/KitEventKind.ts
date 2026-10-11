// What a kit event tells the deployed team's kits: a member used its Elemental Burst, another character came on the
// Field, an enemy took a hit's damage, an effect on the team ran out, particles or orbs reached the party, a member's HP
// Changed, a normal attack of the character on the field landed, a hit triggered reactions on an enemy, or a status on
// An enemy struck on its own schedule
export enum KitEventKind {
  BurstUsed = "BurstUsed",
  CharacterSwapped = "CharacterSwapped",
  DamageTaken = "DamageTaken",
  EffectExpired = "EffectExpired",
  EnergyParticleCollected = "EnergyParticleCollected",
  HealthChanged = "HealthChanged",
  NormalAttackLanded = "NormalAttackLanded",
  ReactionTriggered = "ReactionTriggered",
  StatusTicked = "StatusTicked",
}
