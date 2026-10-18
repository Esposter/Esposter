import type { StatueLandmark } from "#src/models/world/StatueLandmark";

import { LandmarkKind } from "#src/models/world/LandmarkKind";
import { computeStatueInteractables, getStatuePromptLandmarkId } from "#src/services/statue/computeStatueInteractables";
import { InteractionKind } from "genshin-interface";
import { describe, expect, test } from "vitest";

describe(computeStatueInteractables, () => {
  test("a resonated statue offers the worship statue and the statue's blessing", () => {
    expect.hasAssertions();

    const GROUND_HEIGHT = 3;
    const NAMES = { blessing: "Statue's Blessing", worship: "Worship Statue" };
    const statue: StatueLandmark = {
      areaId: "mondstadt",
      heightOffset: 0,
      id: "windrise-statue-of-the-seven",
      kind: LandmarkKind.StatueOfTheSeven,
      position: { x: 1, z: 2 },
      rotation: 0,
    };
    const position = { x: 1, y: GROUND_HEIGHT, z: 2 };

    expect(computeStatueInteractables([statue], NAMES, () => GROUND_HEIGHT)).toStrictEqual([
      { id: "windrise-statue-of-the-seven/worship", kind: InteractionKind.Activate, name: "Worship Statue", position },
      {
        id: "windrise-statue-of-the-seven/blessing",
        kind: InteractionKind.Activate,
        name: "Statue's Blessing",
        position,
      },
    ]);
  });

  test("a prompt's landmark id is the statue's, without the prompt's suffix", () => {
    expect.hasAssertions();

    expect(getStatuePromptLandmarkId("windrise-statue-of-the-seven/worship")).toBe("windrise-statue-of-the-seven");
  });
});
