import type { Texture } from "#src/models/genshinAssets/fit/Texture";

import { averageSurfaceDetails, computeTextureDetail } from "#src/services/genshinAssets/fit/computeTextureDetail";
import { computeStatisticalStructure } from "#src/services/genshinParity/passes/computeStatisticalStructure";
import { computeSurfaceOctaves, SURFACE_DETAIL_METRES_PER_TEXEL } from "genshin-engine";
import { describe, expect, test } from "vitest";

const SIZE = 128;
const FULL_MASK = new Uint8Array(SIZE * SIZE).fill(1);
// The structure error a surface matched in distribution is held to: a reproduction of its export within the gate
const GATE = 0.25;
// A grey texture of the luminance each texel is given, as bytes
const createTexture = (luminance: (x: number, y: number) => number): Texture => {
  const data = Buffer.alloc(SIZE * SIZE);
  for (let y = 0; y < SIZE; y++) for (let x = 0; x < SIZE; x++) data[y * SIZE + x] = Math.round(luminance(x, y));
  return { data, info: { channels: 1, height: SIZE, width: SIZE } };
};
// The luminance of a texture whose texels are a sum of waves, each octave one cosine at its frequency in the world
const createWaveLuminance =
  (octaves: { amplitude: number; frequency: number; phase: number }[]) =>
  (x: number, _y: number): number => {
    const worldX = x * SURFACE_DETAIL_METRES_PER_TEXEL;
    const variation = octaves.reduce(
      (sum, { amplitude, frequency, phase }) => sum + amplitude * Math.cos(2 * Math.PI * frequency * worldX + phase),
      0,
    );
    return 128 * (1 + variation);
  };
const toLuminance = (texture: Texture): Float32Array => Float32Array.from(texture.data, (byte) => byte / 128);

describe(computeTextureDetail, () => {
  test("reads no detail off a flat texture", () => {
    expect.hasAssertions();
    expect(computeTextureDetail(createTexture(() => 128))).toStrictEqual({ bands: [0, 0, 0, 0], variance: 0 });
  });
});

describe(averageSurfaceDetails, () => {
  test("averages each band and the variance over the details it is given, each weighted by its area", () => {
    expect.hasAssertions();
    expect(
      averageSurfaceDetails([
        { detail: { bands: [1, 2], variance: 4 }, weight: 3 },
        { detail: { bands: [5, 6], variance: 0 }, weight: 1 },
      ]),
    ).toStrictEqual({ bands: [2, 3], variance: 3 });
  });

  test("gives no detail for no surface", () => {
    expect.hasAssertions();
    expect(averageSurfaceDetails([])).toBeUndefined();
  });

  test("gives no detail for surfaces sampled over no area", () => {
    expect.hasAssertions();
    expect(averageSurfaceDetails([{ detail: { bands: [1], variance: 1 }, weight: 0 }])).toBeUndefined();
  });
});

describe("detail closure", () => {
  test("reproduces an export's band energies within the gate from octaves fitted to it", () => {
    expect.hasAssertions();
    const exported = createTexture(
      createWaveLuminance([
        { amplitude: 0.2, frequency: 1 / (2 * Math.PI * 1) / SURFACE_DETAIL_METRES_PER_TEXEL, phase: 0.3 },
        { amplitude: 0.1, frequency: 1 / (2 * Math.PI * 4) / SURFACE_DETAIL_METRES_PER_TEXEL, phase: 1.1 },
      ]),
    );
    const detail = computeTextureDetail(exported);
    if (!detail) throw new Error("the export holds detail");
    const ours = createTexture(
      createWaveLuminance(
        computeSurfaceOctaves(detail).map(({ amplitude, frequency }) => ({ amplitude, frequency, phase: 0.7 })),
      ),
    );
    expect(
      computeStatisticalStructure(toLuminance(exported), toLuminance(ours), FULL_MASK, FULL_MASK, SIZE, SIZE),
    ).toBeLessThan(GATE);
  });
});
