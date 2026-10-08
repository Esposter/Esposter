import { shiftTargetAcross } from "#src/services/genshinParity/passes/shiftTargetAcross";
import { describe, expect, test } from "vitest";

describe(shiftTargetAcross, () => {
  test("moves each row across by whole pixels, its first pixels repeating its edge", () => {
    expect.hasAssertions();

    const values = Float32Array.from([1, 0, 0, 1, 2, 0, 0, 1, 3, 0, 0, 1, 4, 0, 0, 1]);

    expect(shiftTargetAcross(values, 2, 1)).toStrictEqual(
      Float32Array.from([1, 0, 0, 1, 1, 0, 0, 1, 3, 0, 0, 1, 3, 0, 0, 1]),
    );
  });
});
