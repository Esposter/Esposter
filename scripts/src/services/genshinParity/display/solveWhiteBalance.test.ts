import type { DisplaySample } from "#src/models/genshinParity/display/DisplaySample";
import type { Vector } from "#src/models/shared/Vector";

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
      shares.map(([sunShare, skyShare]) => {
        const { x, y, z } = new Vector3(
          ...albedo.map((value, channel) => value * (sunShare * (sun[channel] ?? 0) + skyShare * (sky[channel] ?? 0))),
        ).applyMatrix3(balance);
        return { albedo, display: toneMapGenshin([x, y, z]) };
      }),
    );
    const { whiteBalance: solved } = await solveWhiteBalance(samples);

    expect(solved.temperature).toBeCloseTo(whiteBalance.temperature, 0);
  });
});
