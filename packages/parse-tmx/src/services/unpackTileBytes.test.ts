import { unpackTileBytes } from "#src/services/unpackTileBytes";
import { describe, expect, test } from "vitest";

describe(unpackTileBytes, () => {
  const bufferSize = Uint32Array.BYTES_PER_ELEMENT;

  test("reads each whole tile as one little-endian id", () => {
    expect.hasAssertions();

    const buffer = Buffer.alloc(bufferSize);
    buffer.writeUInt32LE(1, 0);

    expect(unpackTileBytes(buffer)).toStrictEqual([1]);
  });

  test("refuses bytes that are not whole tiles", () => {
    expect.hasAssertions();

    const buffer = Buffer.alloc(bufferSize + 1);

    expect(() => unpackTileBytes(buffer)).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: TMXLayer, expected whole 4-byte tiles, received 5 bytes]`,
    );
  });
});
