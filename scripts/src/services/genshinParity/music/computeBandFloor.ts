import { LISTEN_FLOOR_DECIBELS } from "#src/services/genshinParity/shared/constants";

// The level a band of the game's sound is read no quieter than, far enough under its loudest frame that a band quiet on
// Both sides costs the score nothing
export const computeBandFloor = (energies: Float64Array): number =>
  Math.max(...energies) * 10 ** (-LISTEN_FLOOR_DECIBELS / 10);
