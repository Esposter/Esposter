import type { HomeRealmVisit } from "#src/models/home/HomeRealmVisit";

import { leaveHomeRealm } from "#src/services/home/leaveHomeRealm";
import { describe, expect, test } from "vitest";

describe(leaveHomeRealm, () => {
  const REGION_ID = "region";
  // The open-world place the player went into the realm from, the pose they were at there
  const visit: HomeRealmVisit = { pose: { heightOffset: 0, point: { x: 1, z: 2 }, yaw: 0 }, regionId: REGION_ID };

  test("the gadget leaves the realm where the player went in", () => {
    expect.hasAssertions();

    expect(leaveHomeRealm(visit)).toStrictEqual(visit);
  });
});
