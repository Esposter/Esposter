// What a kit event tells the deployed team's kits: a member used its Elemental Burst, another character came on the
// Field, an enemy took a hit's damage, an effect on the team ran out, particles or orbs reached the party, a member's HP
// Changed, the character on the field picked up Mora, a normal attack of the character on the field landed, a hit
// Triggered reactions on an enemy, a status on an enemy struck on its own schedule, or a taunt took an enemy's strike
export enum KitEventKind {
  BurstUsed = "BurstUsed",
  CharacterSwapped = "CharacterSwapped",
  DamageTaken = "DamageTaken",
  EffectExpired = "EffectExpired",
  EnergyParticleCollected = "EnergyParticleCollected",
  HealthChanged = "HealthChanged",
  MoraPickedUp = "MoraPickedUp",
  NormalAttackLanded = "NormalAttackLanded",
  ReactionTriggered = "ReactionTriggered",
  StatusTicked = "StatusTicked",
  TauntDamaged = "TauntDamaged",
}
