import { computeHomeRealmVisit } from "#src/services/home/computeHomeRealmVisit";
import { describe, expect, test } from "vitest";

describe(computeHomeRealmVisit, () => {
  test("the visit keeps the region and the pose its height above the ground gives", () => {
    expect.hasAssertions();

    expect(computeHomeRealmVisit({ position: { x: 1, y: 3, z: 2 }, yaw: 0.5 }, 1, "made-up-region")).toStrictEqual({
      pose: { heightOffset: 2, point: { x: 1, z: 2 }, yaw: 0.5 },
      regionId: "made-up-region",
    });
  });
});
