import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

const ICE_LOTUS_REDUCTION = 1;

// Ice Lotus, an onstage: the active character takes one less DMG, for two usages
export const iceLotus: GcgCardModule = {
  initialUsages: 2,
  modifyDamageReceived: (_context, value, zoneCard) => {
    zoneCard.usages -= 1;
    return Math.max(0, value - ICE_LOTUS_REDUCTION);
  },
};
