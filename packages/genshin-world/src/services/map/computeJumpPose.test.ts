import type { StatueLandmark } from "#src/models/world/StatueLandmark";

import { LandmarkKind } from "#src/models/world/LandmarkKind";
import { computeJumpPose } from "#src/services/map/computeJumpPose";
import { describe, expect, test } from "vitest";

describe(computeJumpPose, () => {
  test("a jump lands at the game's arrival point", () => {
    expect.hasAssertions();

    const landmark: StatueLandmark = {
      areaId: "",
      arrival: { heightOffset: 2, position: { x: 30, z: -40 }, rotation: Math.PI / 2 },
      heightOffset: 1,
      id: "",
      kind: LandmarkKind.StatueOfTheSeven,
      position: { x: 0, z: 0 },
      rotation: 0,
    };

    expect(computeJumpPose(landmark)).toStrictEqual({ heightOffset: 2, point: { x: 30, z: -40 }, yaw: Math.PI / 2 });
  });
});
