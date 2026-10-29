import { computeRectangleSide } from "#src/services/genshinParity/probe/computeRectangleSide";
import { describe, expect, test } from "vitest";

describe(computeRectangleSide, () => {
  test("should read a half-black, half-white rectangle's mean, its even ink and the step between its halves from each side", () => {
    expect.hasAssertions();

    const WIDTH = 8;
    const HEIGHT = 8;
    const BLACK = 0;
    const WHITE = 255;
    const CHANNELS = 3;
    // Left half black, right half white, so the one step is vertical, at the middle of the rectangle
    const pixels = new Uint8Array(WIDTH * HEIGHT * CHANNELS);
    for (let index = 0; index < WIDTH * HEIGHT; index++) {
      const value = index % WIDTH < WIDTH / 2 ? BLACK : WHITE;
      pixels.fill(value, index * CHANNELS, index * CHANNELS + CHANNELS);
    }

    expect(computeRectangleSide(pixels, WIDTH, HEIGHT)).toStrictEqual({
      columnInk: [1020, 1020, 1020, 1020, 1020, 1020, 1020, 1020],
      edges: { left: 3.5, right: 3.5 },
      mean: [128, 128, 128],
      rowInk: [1020, 1020, 1020, 1020, 1020, 1020, 1020, 1020],
    });
  });
});
