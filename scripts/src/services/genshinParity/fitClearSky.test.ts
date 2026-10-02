import { fitClearSky } from "#src/services/genshinParity/fitClearSky";
import { describe, expect, test } from "vitest";

describe(fitClearSky, () => {
  test("fits the clear sky under a cloud however its gradient runs across the frame", () => {
    expect.hasAssertions();

    const size = 40;
    // A sky twice as bright toward its sun on the right as on the left, with a cloud half as bright again on that side
    const clear = Float32Array.from({ length: size * size }, (_, pixel) => 0.2 * (1 + (pixel % size) / size));
    const checkIsCloud = (pixel: number): boolean => pixel % size > 25 && Math.floor(pixel / size) < 15;
    const luminance = clear.map((value, pixel) => (checkIsCloud(pixel) ? value * 1.5 : value));
    const fitted = fitClearSky(luminance, new Uint8Array(size * size).fill(1), size, size, 1.15);
    const clouds = Array.from(luminance, (value, pixel) => Math.log(value) - (fitted[pixel] ?? 0) > Math.log(1.15));

    expect(clouds).toStrictEqual(Array.from(luminance, (_, pixel) => checkIsCloud(pixel)));
  });
});
