// A statue part's surface as typed arrays: its vertices' positions, three numbers a vertex, their colours, three linear
// Numbers a vertex, and the indices of its triangles, three a triangle
export interface StatueSurface {
  colors: Float32Array;
  indices: Uint32Array;
  positions: Float32Array;
}
