import stoneLight from "#src/data/login/stoneLight.json";
import { computeStoneHarmonics, STONE_HARMONIC_COUNT } from "genshin-engine";
import { describe, expect, test } from "vitest";

describe("stoneLight", () => {
  // Faces turned every way round the sphere, by a golden-angle spiral
  const normals = Array.from({ length: 200 }, (_value, index) => {
    const y = 1 - (2 * (index + 0.5)) / 200;
    const radius = Math.sqrt(1 - y * y);
    const azimuth = index * Math.PI * (3 - Math.sqrt(5));
    return [radius * Math.cos(azimuth), y, radius * Math.sin(azimuth)];
  });
  const hours = Object.entries(stoneLight);
  // How far below none a sky may read from its terms' rounding alone, each kept to four decimals: nine terms of up to 2
  // Each off by half the last decimal
  const ROUNDING = 9 * 2 * 0.00005;

  // Every light is one the scene could cast: lights that cancel one another below none turn a part's colour as its
  // Facing or its height changes, which the night's towers showed as a rainbow up each of them
  test.each(hours)(
    "lights %s's stone with no light below none",
    (_hour, { harmonics, hazeColor, hazeScatterColor, heightFade, ramp }) => {
      expect.hasAssertions();
      expect(Math.min(...heightFade, ...hazeColor, ...hazeScatterColor)).toBeGreaterThanOrEqual(0);

      for (const [knot, color] of ramp.entries())
        for (const [channel, value] of color.entries())
          expect(value).toBeGreaterThanOrEqual(ramp[knot - 1]?.[channel] ?? 0);

      const terms = Array.from({ length: STONE_HARMONIC_COUNT }, () => 0);
      for (const normal of normals) {
        computeStoneHarmonics(normal, terms);
        for (const channel of [0, 1, 2])
          expect(
            terms.reduce((sum, value, term) => sum + value * (harmonics[term]?.[channel] ?? 0), 0),
          ).toBeGreaterThanOrEqual(-ROUNDING);
      }
    },
  );
});
