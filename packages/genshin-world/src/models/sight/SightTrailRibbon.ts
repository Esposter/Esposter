// The buffers a sight's trails are written into each frame: each vertex's position and colour as three numbers, and the
// Indices that join the vertices into triangles, sized for every trail the sight can draw
export interface SightTrailRibbon {
  colors: Float32Array;
  indices: Uint32Array;
  positions: Float32Array;
}
