export const unpackTileBytes = (buffer: Buffer, expectedCount: number): number[] => {
  const unpackedTiles: number[] = [];
  if (buffer.length !== expectedCount)
    throw new Error(`Expected ${expectedCount} bytes of tile data; received ${buffer.length}`);

  for (let i = 0; i < expectedCount; i += 4) unpackedTiles.push(buffer.readUInt32LE(i));

  return unpackedTiles;
};
