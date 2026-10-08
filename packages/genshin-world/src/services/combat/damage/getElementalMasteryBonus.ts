import type { ElementalMasteryCurve } from "#src/models/combat/ElementalMasteryCurve";

// The bonus elemental mastery adds to a kind of reaction, as a fraction, falling off the more mastery there is
export const getElementalMasteryBonus = (elementalMastery: number, { offset, scale }: ElementalMasteryCurve): number =>
  (scale * elementalMastery) / (elementalMastery + offset);
