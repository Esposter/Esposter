import type { DisplaySample } from "#src/models/genshinParity/display/DisplaySample";

import { ALBEDOS, SHARES, SKY, SUN } from "#src/services/genshinParity/display/constants.test";
import { solveWhiteBalance } from "#src/services/genshinParity/display/solveWhiteBalance";
import { computeWhiteBalance, toneMapGenshin } from "genshin-engine";
import { Vector3 } from "three";
import { describe, expect, test } from "vitest";

describe(solveWhiteBalance, () => {
  test("finds the white balance the samples were shown through", async () => {
    expect.hasAssertions();

    // Two lights of their own colours, mixed in each pixel's own shares over albedos of their own, then balanced
    const whiteBalance = { temperature: -10, tint: 0 };
    const balance = computeWhiteBalance(whiteBalance);
    const samples: DisplaySample[] = ALBEDOS.flatMap((albedo) =>
      SHARES.map(([sunShare, skyShare]) => {
        const { x, y, z } = new Vector3(
          ...albedo.map((value, channel) => value * (sunShare * (SUN[channel] ?? 0) + skyShare * (SKY[channel] ?? 0))),
        ).applyMatrix3(balance);
        return { albedo, display: toneMapGenshin([x, y, z]) };
      }),
    );
    const { whiteBalance: solved } = await solveWhiteBalance(samples);

    expect(solved.temperature).toBeCloseTo(whiteBalance.temperature, 0);
  });
});
