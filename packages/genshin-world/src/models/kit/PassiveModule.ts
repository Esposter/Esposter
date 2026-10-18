import type { Kit } from "#src/models/kit/Kit";

// What a passive does once its numbers are read, whether a weapon's or an artifact set's, as a kit's passive does: the
// Attributes it adds to its wielder's or wearer's pricing at the HP it stands at, the stats it converts from its Max
// HP, the strikes it adds to, the events of combat it answers and the clock it keeps each step, each read as its own
// Kit reads them
export type PassiveModule = Pick<
  Kit,
  | "getChargedAttackStaminaMultiplier"
  | "getConversionBonuses"
  | "getPartyReactionBonus"
  | "getPartyStrikeBonus"
  | "getPassiveBonuses"
  | "getStrikeAdditiveBaseDamageBonus"
  | "getStrikeCriticalRateBonus"
  | "getStrikeDamageBonus"
  | "onKitEvent"
  | "onStep"
>;
