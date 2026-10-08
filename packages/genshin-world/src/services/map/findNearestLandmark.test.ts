import type { StatueLandmark } from "#src/models/world/StatueLandmark";

import { LandmarkKind } from "#src/models/world/LandmarkKind";
import { findNearestLandmark } from "#src/services/map/findNearestLandmark";
import { describe, expect, test } from "vitest";

describe(findNearestLandmark, () => {
  test("picks the landmark standing nearest the point, or none with no landmark loaded", () => {
    expect.hasAssertions();

    const farStatue: StatueLandmark = {
      areaId: "",
      heightOffset: 0,
      id: "far",
      kind: LandmarkKind.StatueOfTheSeven,
      position: { x: 10, z: 0 },
      rotation: 0,
    };
    const nearStatue: StatueLandmark = { ...farStatue, id: "near", position: { x: 2, z: 0 } };

    expect([
      findNearestLandmark([farStatue, nearStatue], { x: 0, z: 0 }),
      findNearestLandmark([], { x: 0, z: 0 }),
    ]).toStrictEqual([nearStatue, undefined]);
  });
});
