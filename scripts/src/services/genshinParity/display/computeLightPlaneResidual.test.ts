import type { DisplaySample } from "#src/models/genshinParity/display/DisplaySample";
import type { Vector } from "#src/models/shared/Vector";

import { computeLightPlaneResidual } from "#src/services/genshinParity/display/computeLightPlaneResidual";
import { GENSHIN_TONE_CONTRAST, toneMapGenshin } from "genshin-engine";
import { describe, expect, test } from "vitest";

describe(computeLightPlaneResidual, () => {
  // Two lights of their own colours, mixed in each pixel's own shares over albedos of their own
  const sun: Vector = [1, 0.8, 0.5];
  const sky: Vector = [0.3, 0.5, 1];
  const albedos: Vector[] = [
    [0.5, 0.4, 0.3],
    [0.2, 0.6, 0.4],
    [0.7, 0.3, 0.6],
  ];
  const shares: [number, number][] = [
    [0, 1],
    [1, 0.2],
    [3, 0.5],
  ];
  const samples: DisplaySample[] = albedos.flatMap((albedo) =>
    shares.map(([sunShare, skyShare]) => ({
      albedo,
      display: toneMapGenshin([
        albedo[0] * (sunShare * sun[0] + skyShare * sky[0]),
        albedo[1] * (sunShare * sun[1] + skyShare * sky[1]),
        albedo[2] * (sunShare * sun[2] + skyShare * sky[2]),
      ]),
    })),
  );

  test("lays the light flat on the plane two lights span only at the contrast the samples were shown through", () => {
    expect.hasAssertions();

    const residual = computeLightPlaneResidual(samples, GENSHIN_TONE_CONTRAST);

    expect({
      isHigherOff: computeLightPlaneResidual(samples, GENSHIN_TONE_CONTRAST + 0.1) > residual,
      isLowerOff: computeLightPlaneResidual(samples, GENSHIN_TONE_CONTRAST - 0.1) > residual,
      residual,
    }).toStrictEqual({ isHigherOff: true, isLowerOff: true, residual: expect.closeTo(0) });
  });
});
