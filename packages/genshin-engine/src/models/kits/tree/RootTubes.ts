// A tree's surface roots as typed arrays: its vertices' positions and normals, three numbers a vertex, their texture
// Coordinates, two a vertex, and the indices of its triangles, three a triangle
export interface RootTubes {
  indices: Uint32Array;
  normals: Float32Array;
  positions: Float32Array;
  uvs: Float32Array;
}
