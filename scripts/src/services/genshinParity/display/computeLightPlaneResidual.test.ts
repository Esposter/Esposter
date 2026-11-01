import type { DisplaySample } from "#src/models/genshinParity/display/DisplaySample";

import { computeLightPlaneResidual } from "#src/services/genshinParity/display/computeLightPlaneResidual";
import { ALBEDOS, SHARES, SKY, SUN } from "#src/services/genshinParity/display/constants.test";
import { GENSHIN_TONE_CONTRAST, toneMapGenshin } from "genshin-engine";
import { Matrix3 } from "three";
import { describe, expect, test } from "vitest";

describe(computeLightPlaneResidual, () => {
  const samples: DisplaySample[] = ALBEDOS.flatMap((albedo) =>
    SHARES.map(([sunShare, skyShare]) => ({
      albedo,
      display: toneMapGenshin([
        albedo[0] * (sunShare * SUN[0] + skyShare * SKY[0]),
        albedo[1] * (sunShare * SUN[1] + skyShare * SKY[1]),
        albedo[2] * (sunShare * SUN[2] + skyShare * SKY[2]),
      ]),
    })),
  );

  test("reads a light off any plane as off it through a balance that would flatten it by itself", () => {
    expect.hasAssertions();

    // Three lights no plane holds, through a balance all but losing the blue
    const offPlaneSamples: DisplaySample[] = [
      [1, 0.1, 0.1],
      [0.1, 1, 0.1],
      [0.1, 0.1, 1],
    ].map((light) => ({ albedo: [1, 1, 1], display: toneMapGenshin([light[0] ?? 0, light[1] ?? 0, light[2] ?? 0]) }));
    const residual = computeLightPlaneResidual(offPlaneSamples, GENSHIN_TONE_CONTRAST, new Matrix3());

    expect(
      computeLightPlaneResidual(
        offPlaneSamples,
        GENSHIN_TONE_CONTRAST,
        new Matrix3().set(1, 0, 0, 0, 1, 0, 0, 0, 1e-4),
      ),
    ).toBeGreaterThan(residual / 2);
  });

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
