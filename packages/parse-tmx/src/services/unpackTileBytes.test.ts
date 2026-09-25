import { unpackTileBytes } from "#src/services/unpackTileBytes";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(unpackTileBytes, () => {
  const bufferSize = Uint32Array.BYTES_PER_ELEMENT;

  test("unpacks", () => {
    expect.hasAssertions();

    const buffer = Buffer.alloc(bufferSize);
    buffer.writeUInt32LE(1, 0);

    expect(unpackTileBytes(buffer, 1)).toStrictEqual([1]);
  });

  test("fails to unpack incorrect size", () => {
    expect.hasAssertions();

    const buffer = Buffer.alloc(bufferSize);
    buffer.writeUInt32LE(1, 0);

    expect(() => unpackTileBytes(buffer, 2)).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: ${new InvalidOperationError(Operation.Read, "TMXLayer", `expected ${bufferSize * 2} bytes of tile data, received ${buffer.length}`).message}]`,
    );
  });
});
