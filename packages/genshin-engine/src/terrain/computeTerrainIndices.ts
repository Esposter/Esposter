// The triangles of one tile's grid, which every tile shares since every tile is the same grid: two per cell, each
// Wound counter-clockwise seen from above. A tile's vertices fit sixteen-bit indices
export const computeTerrainIndices = (cellsPerSide: number): Uint16Array => {
  const side = cellsPerSide + 1;
  const indices = new Uint16Array(cellsPerSide * cellsPerSide * 6);
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
