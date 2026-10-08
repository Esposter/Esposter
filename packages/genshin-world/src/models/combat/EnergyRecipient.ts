import type { Element } from "#src/models/Element";

// A party member picking up energy: their element if they have one, their energy recharge as a multiplier, whether they
// Are the one on the field, and how many are in the party
export interface EnergyRecipient {
  element?: Element;
  energyRecharge: number;
  isActive: boolean;
  partySize: number;
}
