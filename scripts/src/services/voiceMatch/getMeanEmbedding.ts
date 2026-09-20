// The centre of a speaker's voice: the renormalised mean of their clips' unit vectors, which is what averaging a
// Reference over several clips means
export const getMeanEmbedding = (embeddings: Float32Array[]): Float32Array => {
  const [first] = embeddings;
  const mean = new Float32Array(first?.length ?? 0);
  for (const embedding of embeddings)
    for (const [index, value] of embedding.entries()) mean[index] = (mean[index] ?? 0) + value;
  const norm = Math.hypot(...mean) || 1;
  return mean.map((value) => value / norm);
};
