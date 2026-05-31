export const unpackTileBytes = (bytes: Uint8Array, expectedCount: number): number[] => {
  const unpackedTiles: number[] = [];
  if (bytes.byteLength !== expectedCount)
    throw new Error(`Expected ${expectedCount} bytes of tile data; received ${bytes.byteLength}`);

  const dataView = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  for (let i = 0; i < expectedCount; i += 4) unpackedTiles.push(dataView.getUint32(i, true));

  return unpackedTiles;
};
