import { STORMTERROR_WIND_CURRENTS } from "#src/services/bosses/stormterror";
import { DOMAIN_ARENA_SPREAD } from "#src/services/domains/constants";

// The wind currents' stand-in places on the arena, one per current and evenly spaced round a ring beyond the camp's, so none
// Stands under Dvalin's camp. The scene export places them, so these are PROVISIONAL
const WIND_CURRENT_RING_RADIUS = DOMAIN_ARENA_SPREAD * 2;

export const computeStormterrorWindCurrentPlaces = (center: { x: number; z: number }) =>
  STORMTERROR_WIND_CURRENTS.map(({ name }, index) => {
    const angle = (index / STORMTERROR_WIND_CURRENTS.length) * 2 * Math.PI;
    return {
      name,
      position: {
        x: center.x + Math.cos(angle) * WIND_CURRENT_RING_RADIUS,
        z: center.z + Math.sin(angle) * WIND_CURRENT_RING_RADIUS,
      },
    };
  });
