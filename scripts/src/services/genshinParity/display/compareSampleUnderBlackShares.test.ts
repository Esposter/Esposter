import type { StoneLightSample } from "#src/models/genshinParity/witness/StoneLightSample";

import { compareSampleUnderBlackShares } from "#src/services/genshinParity/display/compareSampleUnderBlackShares";
import { STONE_HARMONIC_COUNT, STONE_RAMP_KNOT_COUNT } from "genshin-engine";
import { Matrix3 } from "three";
import { describe, expect, test } from "vitest";

describe(compareSampleUnderBlackShares, () => {
  test("counts the channels the balance takes under the curve's black in ours and the reference's shown under it", () => {
    expect.hasAssertions();

    const sample: StoneLightSample = {
      albedo: [1, 1, 1],
      bin: "",
      display: [0, 0.5, 0.5],
      emission: [0, 0, 0],
      harmonics: Array.from({ length: STONE_HARMONIC_COUNT }, () => 0),
      height: 0,
      lightBin: "",
      occlusion: 1,
      opacity: 0,
      part: 0,
      rampCoordinate: 0,
      scatter: 0,
    };
    const light = {
      harmonics: Array.from({ length: STONE_HARMONIC_COUNT }, () => [0, 0, 0]),
      hazeColor: [0, 0, 0],
      hazeScatterColor: [0, 0, 0],
      heightFade: [0, 0, 0],
      ramp: Array.from({ length: STONE_RAMP_KNOT_COUNT }, () => [0.5, 0.5, 0.5]),
    };
    const redUnderNone = new Matrix3().set(-1, 0, 0, 0, 1, 0, 0, 0, 1);

    expect(compareSampleUnderBlackShares([sample], light, redUnderNone)).toStrictEqual([
      { ours: [1, 0, 0], reference: [1, 0, 0] },
    ]);
  });
});
