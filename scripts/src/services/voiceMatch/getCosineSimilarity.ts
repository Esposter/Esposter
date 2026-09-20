// Both vectors are unit length already, so the dot product is the cosine
export const getCosineSimilarity = (left: Float32Array, right: Float32Array): number =>
  left.reduce((sum, value, index) => sum + value * (right[index] ?? 0), 0);
