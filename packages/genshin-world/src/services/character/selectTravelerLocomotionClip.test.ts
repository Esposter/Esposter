import { selectTravelerLocomotionClip } from "#src/services/character/selectTravelerLocomotionClip";
import { LocomotionState } from "genshin-engine";
import { describe, expect, test } from "vitest";

describe(selectTravelerLocomotionClip, () => {
  test("the Traveler's walk cycle plays while it walks", () => {
    expect.hasAssertions();

    expect(selectTravelerLocomotionClip(LocomotionState.Walk)).toBe("Ani_Avatar_Girl_WalkCycle");
  });

  test("the Traveler's standing motion plays while it is still", () => {
    expect.hasAssertions();

    expect(selectTravelerLocomotionClip(LocomotionState.Idle)).toBe("Ani_Avatar_Girl_Standby");
  });
});
