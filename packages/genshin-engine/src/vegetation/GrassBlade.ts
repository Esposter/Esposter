// One grass blade's shape in its own units: across from -0.5 to 0.5 at the root, up from 0 to 1, narrowing to a
// Point at the tip. Every blade in a field is this shape, placed and bent in the vertex stage
export interface GrassBlade {
  indices: Uint16Array;
  positions: Float32Array;
}
