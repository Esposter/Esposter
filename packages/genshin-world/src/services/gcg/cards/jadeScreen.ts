import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

const JADE_SCREEN_THRESHOLD = 2;
const JADE_SCREEN_REDUCTION = 1;

// Jade Screen, an onstage: when the active character receives at least 2 DMG, it takes one less, for two usages
export const jadeScreen: GcgCardModule = {
  initialUsages: 2,
  modifyDamageReceived: (_context, value, zoneCard) => {
    if (value < JADE_SCREEN_THRESHOLD) return value;
    zoneCard.usages -= 1;
    return value - JADE_SCREEN_REDUCTION;
  },
};
