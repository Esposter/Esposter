import type { GroundFootprintSource } from "#src/models/genshinAssets/fit/GroundFootprintSource";

// A place the world stands something on, as a disc round its point in the world's axes: its radius in metres, and
// Where that radius was read from
export interface GroundFootprint {
  id: string;
  radius: number;
  source: GroundFootprintSource;
  x: number;
  z: number;
}
