import { InvalidOperationError, Operation } from "@esposter/shared";

export const unpackTileBytes = (bytes: Uint8Array, expectedCount: number): number[] => {
  if (bytes.byteLength !== expectedCount)
    throw new InvalidOperationError(
      Operation.Read,
      "TMXLayer",
      `expected ${expectedCount} bytes of tile data, received ${bytes.byteLength}`,
    );

  const unpackedTiles: number[] = [];
  const dataView = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  for (let i = 0; i < expectedCount; i += Uint32Array.BYTES_PER_ELEMENT)
    unpackedTiles.push(dataView.getUint32(i, true));

  return unpackedTiles;
};
