// A PMX model's vertices as the typed arrays three's skinned geometry reads: three floats a position and a normal, two a
// Texture coordinate, and the four bones each is bound to with their weights, a slot left unused bound to the first
// Bone at no weight
export interface PmxVertices {
  normals: Float32Array;
  positions: Float32Array;
  skinIndices: Uint16Array;
  skinWeights: Float32Array;
  uvs: Float32Array;
}
