import { FLEET_FILL_MAX_TARGET } from "#src/services/fleet/constants";
import { getFillTarget } from "#src/services/fleet/getFillTarget";
import { describe, expect, test } from "vitest";

describe(getFillTarget, () => {
  const CORE_COUNT = 4;
  const PROFILE_TARGET = 1;

  test.each([
    ["1", PROFILE_TARGET, CORE_COUNT, 1],
    ["0", PROFILE_TARGET, CORE_COUNT, 0],
    ["", 0, CORE_COUNT, 0],
    ["", PROFILE_TARGET, CORE_COUNT, PROFILE_TARGET],
    ["", undefined, CORE_COUNT, CORE_COUNT],
    ["", undefined, FLEET_FILL_MAX_TARGET + CORE_COUNT, FLEET_FILL_MAX_TARGET],
  ])(
    "a target of %j with a profile target of %j on %i cores is %i claims",
    (value, profileTarget, coreCount, target) => {
      expect.hasAssertions();

      expect(getFillTarget(value, profileTarget, coreCount)).toBe(target);
    },
  );
});
