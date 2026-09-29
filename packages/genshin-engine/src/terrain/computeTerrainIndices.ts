const MAX_UINT16_VERTEX_COUNT = 2 ** 16;
// The triangles of one tile's grid, which every tile shares since every tile is the same grid: two per cell, each
// Wound counter-clockwise seen from above. Indices are sixteen-bit while a tile's vertices fit them, and 32-bit past
export const computeTerrainIndices = (cellsPerSide: number): Uint16Array | Uint32Array => {
  const side = cellsPerSide + 1;
  const indexCount = cellsPerSide * cellsPerSide * 6;
  const indices = side * side > MAX_UINT16_VERTEX_COUNT ? new Uint32Array(indexCount) : new Uint16Array(indexCount);
  let cursor = 0;
  for (let row = 0; row < cellsPerSide; row++)
    for (let column = 0; column < cellsPerSide; column++) {
      const topLeft = row * side + column;
      const bottomLeft = topLeft + side;
      indices[cursor++] = topLeft;
      indices[cursor++] = bottomLeft;
      indices[cursor++] = topLeft + 1;
      indices[cursor++] = topLeft + 1;
      indices[cursor++] = bottomLeft;
      indices[cursor++] = bottomLeft + 1;
    }
  return indices;
};
