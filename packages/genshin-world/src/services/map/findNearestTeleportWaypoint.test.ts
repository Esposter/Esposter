import type { StatueLandmark } from "#src/models/world/StatueLandmark";
import type { WaypointLandmark } from "#src/models/world/WaypointLandmark";

import { LandmarkKind } from "#src/models/world/LandmarkKind";
import { findNearestTeleportWaypoint } from "#src/services/map/findNearestTeleportWaypoint";
import { describe, expect, test } from "vitest";

describe(findNearestTeleportWaypoint, () => {
  test("game over offers revive at the nearest waypoint", () => {
    expect.hasAssertions();

    const nearStatue: StatueLandmark = {
      areaId: "",
      heightOffset: 0,
      id: "statue",
      kind: LandmarkKind.StatueOfTheSeven,
      position: { x: 1, z: 0 },
      rotation: 0,
    };
    const farWaypoint: WaypointLandmark = {
      arrival: { heightOffset: 0, position: { x: 9, z: 0 }, rotation: 0 },
      areaId: "",
      heightOffset: 0,
      id: "far",
      kind: LandmarkKind.TeleportWaypoint,
      position: { x: 9, z: 0 },
      rotation: 0,
    };
    const nearWaypoint: WaypointLandmark = {
      ...farWaypoint,
      arrival: { heightOffset: 0, position: { x: 4, z: 0 }, rotation: 0 },
      id: "near",
      position: { x: 4, z: 0 },
    };

    expect([
      findNearestTeleportWaypoint([nearStatue, farWaypoint, nearWaypoint], { x: 0, z: 0 }),
      findNearestTeleportWaypoint([nearStatue], { x: 0, z: 0 }),
    ]).toStrictEqual([nearWaypoint, undefined]);
  });
});
