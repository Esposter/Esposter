// A tree's wood swept as tubes, as typed arrays: its vertices' positions and normals, three numbers a vertex, their
// Texture coordinates, two a vertex, and the indices of its triangles, three a triangle
export interface TreeTubes {
  indices: Uint32Array;
  normals: Float32Array;
  positions: Float32Array;
  uvs: Float32Array;
}
