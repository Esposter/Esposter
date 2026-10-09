import { BodyType } from "#src/models/character/BodyType";
import { getImpetuousWindsLocomotion } from "#src/services/party/getImpetuousWindsLocomotion";
import { BodyTypeLocomotionMap } from "#src/services/world/locomotion/BodyTypeLocomotionMap";
import { describe, expect, test } from "vitest";

describe(getImpetuousWindsLocomotion, () => {
  test("raises walking, running, sprinting and dashing speeds by 10%, and leaves the rest as it is", () => {
    expect.hasAssertions();

    const locomotion = BodyTypeLocomotionMap[BodyType.MediumFemale];
    const raised = getImpetuousWindsLocomotion(locomotion);

    expect(raised.walkSpeed / locomotion.walkSpeed).toBeCloseTo(1.1);
    expect(raised.runSpeed / locomotion.runSpeed).toBeCloseTo(1.1);
    expect(raised.sprintSpeed / locomotion.sprintSpeed).toBeCloseTo(1.1);
    expect(raised.dashSpeed / locomotion.dashSpeed).toBeCloseTo(1.1);
    expect({ jumpHeight: raised.jumpHeight, swimSpeed: raised.swimSpeed }).toStrictEqual({
      jumpHeight: locomotion.jumpHeight,
      swimSpeed: locomotion.swimSpeed,
    });
  });
});
