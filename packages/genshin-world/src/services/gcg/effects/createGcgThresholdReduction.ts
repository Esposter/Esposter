import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

// A reduction of the damage the active character takes, by the given value, when the hit is at least the threshold, which
// Spends one of the card's usages each time. Jade Screen and Rain Sword are this reduction with their own numbers
export const createGcgThresholdReduction = (threshold: number, reduction: number, usages: number): GcgCardModule => ({
  initialUsages: usages,
  modifyDamageReceived: (_context, value, zoneCard) => {
    if (value < threshold) return value;
    zoneCard.usages -= 1;
    return value - reduction;
  },
});
