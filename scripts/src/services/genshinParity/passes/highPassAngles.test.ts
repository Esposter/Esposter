import { highPassAngles } from "#src/services/genshinParity/passes/highPassAngles";
import { describe, expect, test } from "vitest";

describe(highPassAngles, () => {
  const WIDTH = 128;
  const HEIGHT = 16;

  test("a field that is constant across its radius reads zero after the high-pass", () => {
    expect.hasAssertions();

    const angles = new Float64Array(WIDTH * HEIGHT).fill(3);

    expect(highPassAngles(angles, WIDTH, 8).every((value) => Math.abs(value) < 1e-9)).toBe(true);
  });

  test("a wave shorter than the radius passes the high-pass, and one longer than it is removed", () => {
    expect.hasAssertions();

    const short = Float64Array.from({ length: WIDTH * HEIGHT }, (_value, pixel) =>
      Math.sin((2 * Math.PI * (pixel % WIDTH)) / 8),
    );
    const long = Float64Array.from({ length: WIDTH * HEIGHT }, (_value, pixel) =>
      Math.sin((2 * Math.PI * (pixel % WIDTH)) / 96),
    );
    const radius = 16;
    const shortAmplitude = Math.max(...highPassAngles(short, WIDTH, radius).slice(WIDTH * 4, WIDTH * 4 + WIDTH));
    const longAmplitude = Math.max(...highPassAngles(long, WIDTH, radius).slice(WIDTH * 4, WIDTH * 4 + WIDTH));

    expect(shortAmplitude).toBeGreaterThan(0.8);
    expect(longAmplitude).toBeLessThan(0.3);
  });

  test("a pixel outside the family stays outside it, and counts toward no neighbour's mean", () => {
    expect.hasAssertions();

    const angles = new Float64Array(WIDTH * HEIGHT).fill(7);
    angles[1] = Number.NaN;
    const result = highPassAngles(angles, WIDTH, 4);

    expect(Number.isNaN(result[1])).toBe(true);
    expect(Math.abs(result[2] ?? 1)).toBeLessThan(1e-9);
  });
});
