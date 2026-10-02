import { transformFourier } from "#src/services/genshinParity/transformFourier";
import { describe, expect, test } from "vitest";

describe(transformFourier, () => {
  test("puts a cosine's energy in its own bin and its mirror", () => {
    expect.hasAssertions();

    const length = 8;
    const real = Float64Array.from({ length }, (_, index) => Math.cos((2 * Math.PI * index) / length));
    const imaginary = new Float64Array(length);
    transformFourier(real, imaginary);
    const magnitudes = Array.from(real, (value, index) => Math.round(Math.hypot(value, imaginary[index] ?? 0)));

    expect(magnitudes).toStrictEqual([0, 4, 0, 0, 0, 0, 0, 4]);
  });
});
