// Writes the index of the tiles a ring draws, each tile's vertices numbered from its ordinal in the ring times the
// Vertices a tile has, and returns how many indices it wrote, which is what the ring draws from the front of the index
export const writeTerrainRingIndices = (
  ringIndices: Uint32Array,
  tileIndices: Uint16Array | Uint32Array,
  drawnOrdinals: readonly number[],
  vertexCount: number,
): number => {
  let cursor = 0;
  for (const ordinal of drawnOrdinals) {
    const base = ordinal * vertexCount;
    for (const index of tileIndices) ringIndices[cursor++] = base + index;
  }
  return cursor;
};
