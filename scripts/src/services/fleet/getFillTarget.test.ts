import { FLEET_FILL_MAX_TARGET } from "#src/services/fleet/constants";
import { getFillTarget } from "#src/services/fleet/getFillTarget";
import { describe, expect, test } from "vitest";

describe(getFillTarget, () => {
  const CORE_COUNT = 4;

  test.each([
    ["", CORE_COUNT, CORE_COUNT],
    ["", FLEET_FILL_MAX_TARGET + CORE_COUNT, FLEET_FILL_MAX_TARGET],
    ["0", CORE_COUNT, 0],
    ["1", CORE_COUNT, 1],
  ])("a target of %j on %i cores is %i claims", (value, coreCount, target) => {
    expect.hasAssertions();

    expect(getFillTarget(value, coreCount)).toBe(target);
  });
});
