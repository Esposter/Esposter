import { createGaussianHillsHeight } from "#src/terrain/createGaussianHillsHeight";
import { describe, expect, test } from "vitest";

describe(createGaussianHillsHeight, () => {
  test("stands a hill's height over the base at its centre and next to nothing past its reach, across cells", () => {
    expect.hasAssertions();

    // A hill whose reach crosses from the cell at the origin into its neighbours on every side
    const getHeight = createGaussianHillsHeight({ base: 1, hills: [{ height: 2, width: 32, x: 0, z: 0 }] });

    expect(getHeight(0, 0)).toBe(3);
    expect(getHeight(-32, 0)).toBeCloseTo(1 + 2 * Math.exp(-0.5));
    expect(getHeight(200, 0)).toBe(1);
  });
});
