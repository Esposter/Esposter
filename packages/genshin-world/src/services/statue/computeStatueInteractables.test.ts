import type { StatueLandmark } from "#src/models/world/StatueLandmark";

import { LandmarkKind } from "#src/models/world/LandmarkKind";
import { computeStatueInteractables } from "#src/services/statue/computeStatueInteractables";
import { InteractionKind } from "genshin-interface";
import { describe, expect, test } from "vitest";

describe(computeStatueInteractables, () => {
  test("f on a resonated statue opens the blessing screen", () => {
    expect.hasAssertions();

    const GROUND_HEIGHT = 3;
    const BLESSING_NAME = "Statue's Blessing";
    const statue: StatueLandmark = {
      areaId: "mondstadt",
      heightOffset: 0,
      id: "windrise-statue-of-the-seven",
      kind: LandmarkKind.StatueOfTheSeven,
      position: { x: 1, z: 2 },
      rotation: 0,
    };

    expect(computeStatueInteractables([statue], BLESSING_NAME, () => GROUND_HEIGHT)).toStrictEqual([
      {
        id: "windrise-statue-of-the-seven",
        kind: InteractionKind.Activate,
        name: BLESSING_NAME,
        position: { x: 1, y: GROUND_HEIGHT, z: 2 },
      },
    ]);
  });
});
