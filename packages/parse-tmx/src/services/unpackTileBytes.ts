import { InvalidOperationError, Operation } from "@esposter/shared";

// A tile is one little-endian gid of `Uint32Array.BYTES_PER_ELEMENT` bytes, so a byte run that does not divide into
// Whole tiles is malformed before its count is ever read
export const unpackTileBytes = (bytes: Uint8Array): number[] => {
  if (bytes.byteLength % Uint32Array.BYTES_PER_ELEMENT !== 0)
    throw new InvalidOperationError(
      Operation.Read,
      "TMXLayer",
      `expected whole ${Uint32Array.BYTES_PER_ELEMENT}-byte tiles, received ${bytes.byteLength} bytes`,
    );

  const unpackedTiles: number[] = [];
  const dataView = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  for (let byteIndex = 0; byteIndex < bytes.byteLength; byteIndex += Uint32Array.BYTES_PER_ELEMENT)
    unpackedTiles.push(dataView.getUint32(byteIndex, true));

  return unpackedTiles;
};
