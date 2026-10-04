import { readFogOpacity } from "#src/services/genshinParity/sky/readFogOpacity";
import { describe, expect, test } from "vitest";

describe(readFogOpacity, () => {
  const fog = { baseHeight: 0, density: 0.1, heightFalloff: 0.5, startDistance: 10 };

  test("hides nothing within the start distance", () => {
    expect.hasAssertions();

    expect(readFogOpacity([0, 0, 0], [0, 0, 10], fog)).toBe(0);
  });

  test("hides a level ray past its start by its density over the length past it", () => {
    expect.hasAssertions();

    expect(readFogOpacity([0, 0, 0], [0, 0, 20], fog)).toBeCloseTo(1 - Math.exp(-1));
  });

  test("hides a ray climbing out of the haze less than a level one as long", () => {
    expect.hasAssertions();

    const level = readFogOpacity([0, 0, 0], [0, 0, 30], fog);
    const climbing = readFogOpacity([0, 0, 0], [0, 15, 30 * Math.cos(Math.asin(0.5))], fog);

    expect(climbing).toBeLessThan(level);
  });
});
