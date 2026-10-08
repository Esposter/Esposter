import { STONE_DARKENING_TOP } from "#src/nodes/constants";

// The share of an hour's stone light that reaches a face at a height, darkening by the hour's rate a metre up from the
// Scene's ground to `STONE_DARKENING_TOP` and holding past it, as the game's high stone shows its light falling away
// Over tens of metres up the towers where our light alone barely darkens. A face at or below the ground takes it whole
export const computeStoneDarkening = (height: number, heightDarkening: number): number =>
  Math.exp(-heightDarkening * Math.min(Math.max(height, 0), STONE_DARKENING_TOP));
