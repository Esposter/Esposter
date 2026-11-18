import { computeSurfaceWavelength } from "#src/services/genshinParity/passes/computeSurfaceWavelength";
import { describe, expect, test } from "vitest";

const WIDTH = 256;
const HEIGHT = 64;
const DEPTH = 10;
const FOV_DEGREES = 45;
const RADIUS = 16;
const metresPerPixel = (2 * DEPTH * Math.tan((FOV_DEGREES * Math.PI) / 360)) / HEIGHT;
const wave = (period: number, amplitude: number) =>
  Float64Array.from(
    { length: WIDTH * HEIGHT },
    (_value, pixel) => 2 + amplitude * Math.sin((2 * Math.PI * (pixel % WIDTH)) / period),
  );
const measure = (angles: Float64Array, maxLag = WIDTH / 4) =>
  computeSurfaceWavelength({
    angles,
    depth: DEPTH,
    fovDegrees: FOV_DEGREES,
    height: HEIGHT,
    highPassRadius: RADIUS,
    maxLag,
    width: WIDTH,
  });

describe(computeSurfaceWavelength, () => {
  test("the spacing of a family's normal angles reads its wavelength in metres at its depth", () => {
    expect.hasAssertions();

    expect(measure(wave(16, 1))).toBeCloseTo(16 * metresPerPixel, 6);
  });

  test("a family whose normal angles do not vary reads no wavelength", () => {
    expect.hasAssertions();

    expect(measure(new Float64Array(WIDTH * HEIGHT).fill(3))).toBeUndefined();
  });

  test("a family whose normal angles vary less than the normal resolution reads no wavelength", () => {
    expect.hasAssertions();

    expect(measure(wave(16, 0.001))).toBeUndefined();
  });

  test("a variation longer than the lag cap is shape and reads no wavelength", () => {
    expect.hasAssertions();

    expect(measure(wave(96, 1), 40)).toBeUndefined();
  });

  test("a detail under the lag cap is read while a shape-scale variation beyond it is not", () => {
    expect.hasAssertions();

    const detailAndShape = Float64Array.from({ length: WIDTH * HEIGHT }, (_value, pixel) => {
      const x = pixel % WIDTH;
      return 2 + Math.sin((2 * Math.PI * x) / 12) + 3 * Math.sin((2 * Math.PI * x) / 120);
    });

    expect(measure(detailAndShape, 40)).toBeCloseTo(12 * metresPerPixel, 6);
  });
});
