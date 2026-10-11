// Writes a quad's two triangles into the indices from the given start, the quad's four vertices running on from its first
export const writeQuadIndices = (indices: Uint32Array, indexStart: number, vertexStart: number): void => {
  indices[indexStart] = vertexStart;
  indices[indexStart + 1] = vertexStart + 1;
  indices[indexStart + 2] = vertexStart + 2;
  indices[indexStart + 3] = vertexStart;
  indices[indexStart + 4] = vertexStart + 2;
  indices[indexStart + 5] = vertexStart + 3;
};
