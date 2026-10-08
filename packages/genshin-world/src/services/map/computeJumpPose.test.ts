import type { StatueLandmark } from "#src/models/world/StatueLandmark";

import { LandmarkKind } from "#src/models/world/LandmarkKind";
import { computeJumpPose } from "#src/services/map/computeJumpPose";
import { JUMP_STANDOFF_DISTANCE } from "#src/services/map/constants";
import { describe, expect, test } from "vitest";

describe(computeJumpPose, () => {
  test("lands in front of the landmark facing back at it", () => {
    expect.hasAssertions();

    const landmark: StatueLandmark = {
      areaId: "",
      heightOffset: 1,
      id: "",
      kind: LandmarkKind.StatueOfTheSeven,
      position: { x: 0, z: 0 },
      rotation: Math.PI / 2,
    };
    const { heightOffset, point, yaw } = computeJumpPose(landmark);
    // The free camera's forward at a yaw, which must lead from the landing point back to the landmark
    const forward = { x: -Math.sin(yaw), z: -Math.cos(yaw) };

    expect({ forward, heightOffset, point }).toStrictEqual({
      forward: { x: -1, z: expect.closeTo(0) },
      heightOffset: 1,
      point: { x: JUMP_STANDOFF_DISTANCE, z: expect.closeTo(0) },
    });
  });
});
