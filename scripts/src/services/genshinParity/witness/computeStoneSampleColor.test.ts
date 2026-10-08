import type { StoneLightSample } from "#src/models/genshinParity/witness/StoneLightSample";

import { computeStoneSampleColor } from "#src/services/genshinParity/witness/computeStoneSampleColor";
import { STONE_HARMONIC_COUNT, STONE_RAMP_KNOT_COUNT } from "genshin-engine";
import { describe, expect, test } from "vitest";

describe(computeStoneSampleColor, () => {
  test("lights its albedo by the ramp, the sky and the fading light, adds its glow, and blends the haze over it", () => {
    expect.hasAssertions();

    const sample: StoneLightSample = {
      albedo: [0.5, 0.5, 0.5],
      bin: "",
      display: [0, 0, 0],
      emission: [0.1, 0, 0],
      harmonics: Array.from({ length: STONE_HARMONIC_COUNT }, (_value, term) => (term === 0 ? 1 : 0)),
      height: 0,
      lightBin: "",
      occlusion: 1,
      opacity: 0.5,
      part: 0,
      rampCoordinate: 0,
      scatter: 0.5,
    };
    const color = computeStoneSampleColor(sample, {
      harmonics: Array.from({ length: STONE_HARMONIC_COUNT }, () => [0.1, 0.1, 0.1]),
      hazeColor: [1, 0, 0],
      hazeScatterColor: [0, 1, 0],
      heightDarkening: 0,
      heightFade: [0.3, 0.3, 0.3],
      ramp: Array.from({ length: STONE_RAMP_KNOT_COUNT }, () => [0.2, 0.2, 0.2]),
    });

    expect(color.map((channel) => Number(channel.toFixed(4)))).toStrictEqual([0.45, 0.4, 0.15]);
  });
});
