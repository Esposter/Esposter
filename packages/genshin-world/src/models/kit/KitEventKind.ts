// What a kit event tells the deployed team's kits: a member used its Elemental Burst, another character came on the
// Field, an enemy took a hit's damage, an effect on the team ran out, particles or orbs reached the party, a member's
// HP changed, the character on the field picked up Mora or opened a chest in the world, a normal attack of the
// Character on the field landed, a hit triggered reactions on an enemy, a status on an enemy struck on its own
// Schedule, a taunt took an enemy's strike, a shield took a strike on a party member for its owner, or a hit felled an
// Animal in the world
export enum KitEventKind {
  BurstUsed = "BurstUsed",
  CharacterSwapped = "CharacterSwapped",
  ChestOpened = "ChestOpened",
  DamageTaken = "DamageTaken",
  EffectExpired = "EffectExpired",
  EnergyParticleCollected = "EnergyParticleCollected",
  HealthChanged = "HealthChanged",
  MoraPickedUp = "MoraPickedUp",
  NormalAttackLanded = "NormalAttackLanded",
  ReactionTriggered = "ReactionTriggered",
  ShieldAbsorbed = "ShieldAbsorbed",
  StatusTicked = "StatusTicked",
  TauntDamaged = "TauntDamaged",
  WildlifeStruck = "WildlifeStruck",
}
