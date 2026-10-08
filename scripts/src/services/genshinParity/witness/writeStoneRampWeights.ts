import { STONE_RAMP_KNOT_COUNT } from "genshin-engine";

// Each knot of the stone's ramp's weight at a ramp coordinate, the coordinate read between its two nearest knots as a
// Texture's linear filtering reads them
export const writeStoneRampWeights = (coordinate: number, weights: number[]): void => {
  const position = Math.min(Math.max(coordinate, 0), 1) * (STONE_RAMP_KNOT_COUNT - 1);
  const knot = Math.min(Math.floor(position), STONE_RAMP_KNOT_COUNT - 2);
  const share = position - knot;
  weights.fill(0);
  weights[knot] = 1 - share;
  weights[knot + 1] = share;
};
