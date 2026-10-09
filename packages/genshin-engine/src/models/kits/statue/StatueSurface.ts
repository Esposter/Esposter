// A statue part's surface as typed arrays: its vertices' positions, three numbers a vertex, and the indices of its
// Triangles, three a triangle
export interface StatueSurface {
  indices: Uint32Array;
  positions: Float32Array;
}
