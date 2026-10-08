import type { Element } from "#src/models/Element";

// A party member picking up energy: their element, their energy recharge as a multiplier, whether they are the one on
// The field, and how many are in the party
export interface EnergyRecipient {
  element: Element;
  energyRecharge: number;
  isActive: boolean;
  partySize: number;
}
