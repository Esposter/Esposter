// The dome a sky's cloud layer is drawn on, as profiles over its rings from the horizon up, each knot a ring's elevation
// In degrees: where the wisps' strip stands up it, how far from the middle of the density's plane each of the two
// Projections the layer's height blends between reads, and how far its normal tilts from level toward the axis. Round
// The dome every projection turns by the same angle from the azimuth in the game's own axes, and the wisps' strip
// Starts its own turn from it, both in degrees
export interface CloudLayerDome {
  center: readonly number[];
  elevations: readonly number[];
  far: readonly number[];
  near: readonly number[];
  normalElevations: readonly number[];
  turn: number;
  wisps: readonly number[];
  wispsTurn: number;
}
