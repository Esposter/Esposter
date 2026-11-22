import { snapToCorner } from "#src/services/genshinParity/witness/snapToCorner";
import { describe, expect, test } from "vitest";

describe(snapToCorner, () => {
  test("moves a pixel read beside a corner onto it", () => {
    expect.hasAssertions();

    // A square of light filling the lower right from the pixel at 4, 4 of a nine pixel square image
    const side = 9;
    const grey = Float32Array.from({ length: side * side }, (_value, pixel) =>
      Number(pixel % side >= 4 && Math.floor(pixel / side) >= 4),
    );

    const [x, y] = snapToCorner(grey, side, side, [3, 5], 2);

    expect(Math.hypot(x - 3.5, y - 3.5)).toBeLessThanOrEqual(1);
  });
});
