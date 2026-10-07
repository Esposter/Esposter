import { getToneSlope } from "#src/services/genshinParity/display/getToneSlope";
import { toneMapGenshin } from "genshin-engine";
import { describe, expect, test } from "vitest";

describe(getToneSlope, () => {
  test("follows the tone curve's own rise", () => {
    expect.hasAssertions();

    const step = 1e-6;
    const [below] = toneMapGenshin([1 - step, 0, 0]);
    const [above] = toneMapGenshin([1 + step, 0, 0]);
    const [slope] = getToneSlope([1, 0, 0]);

    expect(slope).toBeCloseTo((above - below) / (2 * step));
  });

  test("reads naught past white", () => {
    expect.hasAssertions();

    const [slope] = getToneSlope([20, 0, 0]);

    expect(slope).toBe(0);
  });
});
