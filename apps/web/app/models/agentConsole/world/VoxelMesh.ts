// A voxel grid as triangles: three floats a vertex for its position and its colour, three indices a triangle
export interface VoxelMesh {
  colors: Float32Array;
  indices: Uint32Array;
  positions: Float32Array;
}
