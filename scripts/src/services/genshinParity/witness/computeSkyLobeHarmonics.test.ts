import { computeSkyLobeHarmonics } from "#src/services/genshinParity/witness/computeSkyLobeHarmonics";
import { computeStoneHarmonics, STONE_HARMONIC_COUNT } from "genshin-engine";
import { describe, expect, test } from "vitest";

describe(computeSkyLobeHarmonics, () => {
  // Faces turned every way round the sphere, by a golden-angle spiral
  const normals = Array.from({ length: 200 }, (_value, index) => {
    const y = 1 - (2 * (index + 0.5)) / 200;
    const radius = Math.sqrt(1 - y * y);
    const azimuth = index * Math.PI * (3 - Math.sqrt(5));
    return [radius * Math.cos(azimuth), y, radius * Math.sin(azimuth)];
  });
  const direction = [0.48, 0.6, -0.64];
  const lobe = computeSkyLobeHarmonics(direction);
  const lights = normals.map((normal) => {
    const terms = Array.from({ length: STONE_HARMONIC_COUNT }, () => 0);
    computeStoneHarmonics(normal, terms);
    return terms.reduce((sum, value, term) => sum + value * (lobe[term] ?? 0), 0);
  });

  test("lights a face by its cosine to the light's direction", () => {
    expect.hasAssertions();

    for (const [index, normal] of normals.entries()) {
      const cosine = normal.reduce((sum, value, axis) => sum + value * (direction[axis] ?? 0), 0);

      expect(lights[index]).toBeCloseTo(2 / 15 + cosine / 2 + (15 / 32) * cosine ** 2);
    }
  });

  test("lights no face below none", () => {
    expect.hasAssertions();
    expect(Math.min(...lights)).toBeGreaterThanOrEqual(0);
  });
});
