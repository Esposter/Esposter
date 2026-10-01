import { snapToCorner } from "#src/services/genshinParity/snapToCorner";
import { describe, expect, test } from "vitest";

describe(snapToCorner, () => {
  test("moves a pixel read beside a corner onto it", () => {
    expect.hasAssertions();

    // A square of light filling the lower right from the pixel at 4, 4 of a nine pixel square image
    const grey = Float32Array.from({ length: 81 }, (_, pixel) => Number(pixel % 9 >= 4 && Math.floor(pixel / 9) >= 4));

    const [x, y] = snapToCorner(grey, 9, 9, [3, 5], 2);

    expect(Math.hypot(x - 3.5, y - 3.5)).toBeLessThanOrEqual(1);
  });
});
