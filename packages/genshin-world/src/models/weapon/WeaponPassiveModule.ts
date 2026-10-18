import type { Kit } from "#src/models/kit/Kit";

// What a weapon's passive does once its refinement rank is read, as a kit's passive does: the attributes it adds to its
// Wielder's pricing at the HP it stands at, the stats it converts from its wielder's Max HP, and the events of combat
// It answers, each read as its wielder's own kit reads them
export type WeaponPassiveModule = Pick<
  Kit,
  | "getConversionBonuses"
  | "getPassiveBonuses"
  | "getStrikeAdditiveBaseDamageBonus"
  | "getStrikeCriticalRateBonus"
  | "getStrikeDamageBonus"
  | "onKitEvent"
>;
