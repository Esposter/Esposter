import type { Kit } from "#src/models/kit/Kit";

// What a passive does once its numbers are read, whether a weapon's or an artifact set's, as a kit's passive does: the
// attributes it adds to its wielder's or wearer's pricing at the HP it stands at, the strikes it adds to, and the events
// of combat it answers, each read as its own kit reads them
export type PassiveModule = Pick<
  Kit,
  | "getChargedAttackStaminaMultiplier"
  | "getPartyStrikeBonus"
  | "getPassiveBonuses"
  | "getStrikeAdditiveBaseDamageBonus"
  | "getStrikeCriticalRateBonus"
  | "getStrikeDamageBonus"
  | "onKitEvent"
>;
