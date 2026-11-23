import { readFloat32Array } from "#src/services/shared/readFloat32Array";
import { describe, expect, test } from "vitest";

describe(readFloat32Array, () => {
  test("refuses a byte run that is not whole floats, where a view would drop its tail", () => {
    expect.hasAssertions();

    expect(() => readFloat32Array(new Uint8Array(1))).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: readFloat32Array, a byte run of 1 is not a whole number of 32-bit floats]`,
    );
  });
});
