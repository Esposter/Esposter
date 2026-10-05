// A sky's gradient up its band, from the horizon at the first sample to the top of the band at the last, evenly
// Spaced: the red the share of the bottom colour over the top, and the green the horizon halo's
export interface SkyGradient {
  green: readonly number[];
  red: readonly number[];
}
