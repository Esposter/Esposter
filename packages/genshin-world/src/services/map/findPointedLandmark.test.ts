import type { StatueLandmark } from "#src/models/world/StatueLandmark";

import { LandmarkKind } from "#src/models/world/LandmarkKind";
import { findPointedLandmark } from "#src/services/map/findPointedLandmark";
import { describe, expect, test } from "vitest";

// A Statue of The Seven standing at a point on the ground, which is what a jump lands at today
const createStatue = (id: string, x: number): StatueLandmark => ({
  areaId: "",
  heightOffset: 0,
  id,
  kind: LandmarkKind.StatueOfTheSeven,
  position: { x, z: 0 },
  rotation: 0,
});

describe(findPointedLandmark, () => {
  test("a locked waypoint 29 metres away is pointed to", () => {
    expect.hasAssertions();

    const statue = createStatue("near", 29);

    expect(findPointedLandmark([statue], { x: 0, z: 0 }, undefined)).toStrictEqual(statue);
  });

  test("a locked waypoint 31 metres away is not pointed to", () => {
    expect.hasAssertions();

    expect(findPointedLandmark([createStatue("far", 31)], { x: 0, z: 0 }, undefined)).toBeUndefined();
  });

  test("the pointer holds until the player passes 40 metres", () => {
    expect.hasAssertions();

    const statue = createStatue("held", 39);

    expect(findPointedLandmark([statue], { x: 0, z: 0 }, statue.id)).toStrictEqual(statue);
  });

  test("the pointer goes past 40 metres", () => {
    expect.hasAssertions();

    const statue = createStatue("passed", 41);

    expect(findPointedLandmark([statue], { x: 0, z: 0 }, statue.id)).toBeUndefined();
  });
});
