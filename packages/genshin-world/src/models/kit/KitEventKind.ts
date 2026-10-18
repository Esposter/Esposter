// What a kit event tells the deployed team's kits: a member used its Elemental Burst, another character came on the
// Field, an enemy took a hit's damage, a hit applied an element to an enemy, an effect on the team ran out, particles
// Or orbs reached the party, a member's HP changed, the character on the field picked up Mora or opened a chest in the
// World, a normal attack of the character on the field landed, a hit triggered reactions on an enemy, a status on an
// Enemy struck on its own schedule, a taunt took an enemy's strike, or a shield took a strike on a party member for its
// Owner
export enum KitEventKind {
  BurstUsed = "BurstUsed",
  CharacterSwapped = "CharacterSwapped",
  ChestOpened = "ChestOpened",
  DamageTaken = "DamageTaken",
  ElementApplied = "ElementApplied",
  EffectExpired = "EffectExpired",
  EnergyParticleCollected = "EnergyParticleCollected",
  HealthChanged = "HealthChanged",
  MoraPickedUp = "MoraPickedUp",
  NormalAttackLanded = "NormalAttackLanded",
  ReactionTriggered = "ReactionTriggered",
  ShieldAbsorbed = "ShieldAbsorbed",
  StatusTicked = "StatusTicked",
  TauntDamaged = "TauntDamaged",
}
