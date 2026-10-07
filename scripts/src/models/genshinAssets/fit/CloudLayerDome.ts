// The dome a sky's cloud layer is drawn on, as profiles over its rings from the horizon up, each knot a ring's elevation
// In degrees: where the wisps' strip stands up it, how far from the middle of the density's plane each of the two
// Projections the layer's height blends between reads, and how far its normal tilts down from level, inward. Round
// The dome every projection turns by the same angle from the azimuth in the game's own axes, and the wisps' strip
// Starts its own turn from it, both in degrees
export interface CloudLayerDome {
  center: [number, number];
  elevations: number[];
  far: number[];
  near: number[];
  normalElevations: number[];
  turn: number;
  wisps: number[];
  wispsTurn: number;
}
