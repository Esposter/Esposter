import { STONE_SHADOW_EXPONENT } from "#src/nodes/constants";

// Where the game's deferred pass reads its toon ramp for a face: a half plus half its facing to the sun, the facing
// Scaled by the sun's visibility there raised to a fifth, so a face in shadow reads the ramp's middle whatever way it
// Turns. `StoneLightingModel` reads the ramp the same way in its shader, and a light is solved through this
export const computeStoneRampCoordinate = (facing: number, visibility: number): number =>
  0.5 + 0.5 * facing * Math.max(visibility, 0) ** STONE_SHADOW_EXPONENT;
