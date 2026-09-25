import { InvalidOperationError, Operation } from "@esposter/shared";

// A tile is one little-endian gid of `Uint32Array.BYTES_PER_ELEMENT` bytes, so the byte count a layer owes is
// Derived here from its tile count rather than multiplied out by each caller
export const unpackTileBytes = (bytes: Uint8Array, tileCount: number): number[] => {
  const expectedByteCount = tileCount * Uint32Array.BYTES_PER_ELEMENT;
  if (bytes.byteLength !== expectedByteCount)
    throw new InvalidOperationError(
      Operation.Read,
      "TMXLayer",
      `expected ${expectedByteCount} bytes of tile data, received ${bytes.byteLength}`,
    );

  const unpackedTiles: number[] = [];
  const dataView = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  for (let byteIndex = 0; byteIndex < expectedByteCount; byteIndex += Uint32Array.BYTES_PER_ELEMENT)
    unpackedTiles.push(dataView.getUint32(byteIndex, true));

  return unpackedTiles;
};
