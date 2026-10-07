import type { StoneLightSample } from "#src/models/genshinParity/witness/StoneLightSample";
import type { Vector } from "#src/models/shared/Vector";

import { computeHazeResidual } from "#src/services/genshinParity/witness/computeHazeResidual";
import { MIN_BIN_COUNT } from "#src/services/genshinParity/witness/constants";
import { toneMapGenshin } from "genshin-engine";
import { describe, expect, test } from "vitest";

describe(computeHazeResidual, () => {
  // Each part's light in each of its light's bins its own colour, as no ramp and sky the stone light's model draws
  // Would light them, seen through a haze deeper at each of four depths, every bin read over as many pixels as it needs
  const lights: Vector[][] = [
    [
      [0.5, 0.2, 0.1],
      [0.1, 0.4, 0.2],
    ],
    [
      [0.2, 0.1, 0.6],
      [0.7, 0.6, 0.1],
    ],
  ];
  const hazeColor: Vector = [0.3, 0.4, 0.5];
  const albedo: Vector = [0.3, 0.3, 0.3];
  const depthOpacities = [0, 0.2, 0.4, 0.6];
  const drawSamples = (isHazeRead: boolean): StoneLightSample[] =>
    lights.flatMap((partLights, part) =>
      partLights.flatMap((light, lightBinIndex) =>
        depthOpacities.flatMap((opacity, depth) => {
          const sceneColor = light.map(
            (value, channel) => (albedo[channel] ?? 0) * value * (1 - opacity) + (hazeColor[channel] ?? 0) * opacity,
          ) as Vector;
          return Array.from({ length: MIN_BIN_COUNT }, (): StoneLightSample => ({
            albedo,
            bin: `${lightBinIndex}/${depth}`,
            display: toneMapGenshin(sceneColor),
            emission: [0, 0, 0],
            harmonics: [],
            height: 0,
            lightBin: String(lightBinIndex),
            occlusion: 1,
            opacity: isHazeRead ? opacity : 0,
            part,
            rampCoordinate: 0,
            scatter: 0,
          }));
        }),
      ),
    );

  test("leaves nothing under the haze the stone was seen through, however each part's light differs", () => {
    expect.hasAssertions();

    expect(computeHazeResidual(drawSamples(true))).toBeLessThan(1e-3);
  });

  test("leaves the haze's depth unexplained under none", () => {
    expect.hasAssertions();

    expect(computeHazeResidual(drawSamples(false))).toBeGreaterThan(0.01);
  });
});
