import type { StatueLandmark } from "#src/models/world/StatueLandmark";

import { LandmarkKind } from "#src/models/world/LandmarkKind";
import { describe } from "vitest";

// A Statue of The Seven standing at x on the ground's line z = 0, the kind a jump lands at today
export const createStatue = (id: string, x: number): StatueLandmark => ({
  areaId: "",
  heightOffset: 0,
  id,
  kind: LandmarkKind.StatueOfTheSeven,
  position: { x, z: 0 },
  rotation: 0,
});

describe.todo("createStatue");
