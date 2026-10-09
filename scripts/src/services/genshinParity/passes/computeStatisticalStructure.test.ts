import { computeStatisticalStructure } from "#src/services/genshinParity/passes/computeStatisticalStructure";
import { describe, expect, it } from "vitest";

const WIDTH = 160;
const HEIGHT = 160;
const FULL_MASK = new Uint8Array(WIDTH * HEIGHT).fill(1);
// A deterministic pseudo-random texture, so the shifted and flat cases are compared against the same detail
const createTexture = (): Float32Array => {
  let seed = 3;
  return Float32Array.from({ length: WIDTH * HEIGHT }, () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 2 ** 32;
  });
};
// The texture moved by whole pixels, wrapping at its edges, so its statistics are the texture's own
const shiftTexture = (texture: Float32Array, shift: number): Float32Array =>
  Float32Array.from(texture, (_value, index) => {
    const x = index % WIDTH;
    const y = Math.floor(index / WIDTH);
    return texture[y * WIDTH + ((x + shift) % WIDTH)] ?? 0;
  });

describe(computeStatisticalStructure, () => {
  it("scores near zero for the same detail moved across the surface", () => {
    expect.hasAssertions();
    const texture = createTexture();
    expect(
      computeStatisticalStructure(texture, shiftTexture(texture, 3), FULL_MASK, FULL_MASK, WIDTH, HEIGHT),
    ).toBeLessThan(0.05);
  });
  it("scores high for a flat surface against a textured one", () => {
    expect.hasAssertions();
    const texture = createTexture();
    const flat = new Float32Array(WIDTH * HEIGHT).fill(0.5);
    expect(computeStatisticalStructure(texture, flat, FULL_MASK, FULL_MASK, WIDTH, HEIGHT)).toBeCloseTo(1);
  });
});
