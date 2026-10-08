// A lightning bolt's channel as flat typed arrays, a quad a segment: each vertex at its segment's end, the segment's
// Direction, and the signed half width the material spreads it across to face the eye
export interface LightningBolt {
  directions: Float32Array;
  indices: Uint32Array;
  positions: Float32Array;
  sides: Float32Array;
}
