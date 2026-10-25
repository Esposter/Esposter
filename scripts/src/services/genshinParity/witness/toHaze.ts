import type { Haze } from "#src/models/genshinParity/witness/Haze";

// A haze from the logarithms of its density and its falloff and its most opacity's log-odds, the simplex's
// Coordinates, so neither of the first falls under none and the last stays between none and all
export const toHaze = ([density = 0, heightFalloff = 0, maxOpacity = 0]: readonly number[]): Haze => ({
  density: Math.exp(density),
  heightFalloff: Math.exp(heightFalloff),
  maxOpacity: 1 / (1 + Math.exp(-maxOpacity)),
});
