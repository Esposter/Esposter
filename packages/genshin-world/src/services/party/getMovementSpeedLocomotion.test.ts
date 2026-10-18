import { BodyType } from "#src/models/character/BodyType";
import { getMovementSpeedLocomotion } from "#src/services/party/getMovementSpeedLocomotion";
import { BodyTypeLocomotionMap } from "#src/services/world/locomotion/BodyTypeLocomotionMap";
import { describe, expect, test } from "vitest";

describe(getMovementSpeedLocomotion, () => {
  test("raises walking, running, sprinting and dashing speeds by a movement speed, and leaves the rest as it is", () => {
    expect.hasAssertions();
    const locomotion = BodyTypeLocomotionMap[BodyType.MediumFemale];
    const raised = getMovementSpeedLocomotion(locomotion, 0.2);
    expect(raised.walkSpeed / locomotion.walkSpeed).toBeCloseTo(1.2);
    expect(raised.runSpeed / locomotion.runSpeed).toBeCloseTo(1.2);
    expect(raised.sprintSpeed / locomotion.sprintSpeed).toBeCloseTo(1.2);
    expect(raised.dashSpeed / locomotion.dashSpeed).toBeCloseTo(1.2);
    expect({ jumpHeight: raised.jumpHeight, swimSpeed: raised.swimSpeed }).toStrictEqual({
      jumpHeight: locomotion.jumpHeight,
      swimSpeed: locomotion.swimSpeed,
    });
  });
});
