import type { StatueLandmark } from "#src/models/world/StatueLandmark";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { LandmarkKind } from "#src/models/world/LandmarkKind";
import { findLandmarkArea } from "#src/services/map/findLandmarkArea";
import { readCatalogue } from "#src/services/world/readCatalogue";
import { describe, expect, test } from "vitest";

const catalogue = await readCatalogue(GAME_DATA_LOCAL_BASE_URL);

describe(findLandmarkArea, () => {
  test("names the area a chosen landmark stands in, as its teleport panel does", () => {
    expect.hasAssertions();

    const statue: StatueLandmark = {
      areaId: "galesong-hill",
      heightOffset: 0,
      id: "",
      kind: LandmarkKind.StatueOfTheSeven,
      position: { x: 0, z: 0 },
      rotation: 0,
    };

    expect(findLandmarkArea(catalogue, statue)?.name).toBe("Galesong Hill");
  });

  test("names no area for a landmark whose area the catalogue lacks", () => {
    expect.hasAssertions();

    const statue: StatueLandmark = {
      areaId: "no-such-area",
      heightOffset: 0,
      id: "",
      kind: LandmarkKind.StatueOfTheSeven,
      position: { x: 0, z: 0 },
      rotation: 0,
    };

    expect(findLandmarkArea(catalogue, statue)).toBeUndefined();
  });
});
