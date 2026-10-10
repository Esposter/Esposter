// What a kit event tells the deployed team's kits: another character came on the field, an enemy took a hit's damage,
// An effect on the team ran out, a normal attack of the character on the field landed, a hit triggered reactions on an
// Enemy, or a status on an enemy struck on its own schedule
export enum KitEventKind {
  CharacterSwapped = "CharacterSwapped",
  DamageTaken = "DamageTaken",
  EffectExpired = "EffectExpired",
  NormalAttackLanded = "NormalAttackLanded",
  ReactionTriggered = "ReactionTriggered",
  StatusTicked = "StatusTicked",
}
