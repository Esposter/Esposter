import { unpackTileBytes } from "@/util/unpackTileBytes";
import { describe, expect, test } from "vitest";

describe(unpackTileBytes, () => {
  const bufferSize = 4;

  test("unpacks", () => {
    expect.hasAssertions();

    const buffer = Buffer.alloc(bufferSize);
    buffer.writeUInt32LE(1, 0);

    expect(unpackTileBytes(buffer, bufferSize)).toStrictEqual([1]);
  });

  test("fails to unpack incorrect size", () => {
    expect.hasAssertions();

    const buffer = Buffer.alloc(bufferSize);
    buffer.writeUInt32LE(1, 0);

    expect(() => unpackTileBytes(buffer, bufferSize + 1)).toThrowError(
      `Expected ${bufferSize + 1} bytes of tile data; received ${buffer.length}`,
    );
  });
});
