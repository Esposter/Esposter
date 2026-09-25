import { unpackTileBytes } from "#src/services/unpackTileBytes";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(unpackTileBytes, () => {
  const bufferSize = Uint32Array.BYTES_PER_ELEMENT;

  test("unpacks", () => {
    expect.hasAssertions();

    const buffer = Buffer.alloc(bufferSize);
    buffer.writeUInt32LE(1, 0);

    expect(unpackTileBytes(buffer)).toStrictEqual([1]);
  });

  test("fails to unpack bytes that are not whole tiles", () => {
    expect.hasAssertions();

    const buffer = Buffer.alloc(bufferSize + 1);

    expect(() => unpackTileBytes(buffer)).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: ${new InvalidOperationError(Operation.Read, "TMXLayer", `expected whole ${bufferSize}-byte tiles, received ${buffer.length} bytes`).message}]`,
    );
  });
});
