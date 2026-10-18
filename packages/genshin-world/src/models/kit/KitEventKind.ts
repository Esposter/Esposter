// What a kit event tells the deployed team's kits: a member used its Elemental Burst, another character came on the
// Field, an enemy took a hit's damage, a hit applied an element to an enemy, an effect on the team ran out, particles
// Or orbs reached the party, a kit refused a member's fall, a member's HP changed, the character on the field picked up
// Mora or a Crystallize shard or opened a chest in the world, a normal attack of the character on the field started or
// Landed, a hit triggered reactions on an enemy, a status on an enemy struck on its own schedule, a taunt took an
// Enemy's strike, or a shield took a strike on a party member for its owner. A charged attack of the character on the
// Field landed, a skill was used, a hit landed on an enemy with the element it was dealt as, a hit on a weak point
// Landed on an enemy, or a hit defeated one, or a hit felled an animal in the world, or a Nightsoul burst went off on
// An enemy, or a Nightsoul blessing drained a character's points, or an enemy's strike landed on a party
// Member, a shield taking it or not
export enum KitEventKind {
  BurstUsed = "BurstUsed",
  CharacterSwapped = "CharacterSwapped",
  ChargedAttackLanded = "ChargedAttackLanded",
  ChestOpened = "ChestOpened",
  CrystallizeShardPickedUp = "CrystallizeShardPickedUp",
  DamageTaken = "DamageTaken",
  ElementApplied = "ElementApplied",
  EffectExpired = "EffectExpired",
  EnemyDefeated = "EnemyDefeated",
  EnemyHit = "EnemyHit",
  EnergyParticleCollected = "EnergyParticleCollected",
  FallRefused = "FallRefused",
  HealthChanged = "HealthChanged",
  MoraPickedUp = "MoraPickedUp",
  NightsoulBurst = "NightsoulBurst",
  NightsoulPointsConsumed = "NightsoulPointsConsumed",
  NightsoulPointsGained = "NightsoulPointsGained",
  NormalAttackLanded = "NormalAttackLanded",
  NormalAttackStarted = "NormalAttackStarted",
  PartyMemberStruck = "PartyMemberStruck",
  ReactionTriggered = "ReactionTriggered",
  ShieldAbsorbed = "ShieldAbsorbed",
  SkillUsed = "SkillUsed",
  StatusTicked = "StatusTicked",
  TauntDamaged = "TauntDamaged",
  WeakPointHit = "WeakPointHit",
  WildlifeStruck = "WildlifeStruck",
}
