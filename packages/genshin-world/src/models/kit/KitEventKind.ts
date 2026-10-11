// What a kit event tells the deployed team's kits: a member used its Elemental Burst, another character came on the
// Field, an enemy took a hit's damage, an effect on the team ran out, particles or orbs reached the party, a normal
// Attack of the character on the field landed, a hit triggered reactions on an enemy, or a status on an enemy struck on
// Its own schedule
export enum KitEventKind {
  BurstUsed = "BurstUsed",
  CharacterSwapped = "CharacterSwapped",
  DamageTaken = "DamageTaken",
  EffectExpired = "EffectExpired",
  EnergyParticleCollected = "EnergyParticleCollected",
  NormalAttackLanded = "NormalAttackLanded",
  ReactionTriggered = "ReactionTriggered",
  StatusTicked = "StatusTicked",
}
