import { InvalidOperationError, Operation } from "@esposter/shared";

// A tile is one little-endian gid of `Uint32Array.BYTES_PER_ELEMENT` bytes, so a byte run that does not divide into
// Whole tiles is malformed before its count is ever read. The gids are read into a typed array with a DataView, which
// Reads little-endian whatever the host's byte order is, and the array is copied out once.
export const unpackTileBytes = (bytes: Uint8Array): number[] => {
  if (bytes.byteLength % Uint32Array.BYTES_PER_ELEMENT !== 0)
    throw new InvalidOperationError(
      Operation.Read,
      "TMXLayer",
      `expected whole ${Uint32Array.BYTES_PER_ELEMENT}-byte tiles, received ${bytes.byteLength} bytes`,
    );

  const dataView = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const tiles = new Uint32Array(bytes.byteLength / Uint32Array.BYTES_PER_ELEMENT);
  for (let index = 0; index < tiles.length; index++)
    tiles[index] = dataView.getUint32(index * Uint32Array.BYTES_PER_ELEMENT, true);

  return Array.from(tiles);
};
