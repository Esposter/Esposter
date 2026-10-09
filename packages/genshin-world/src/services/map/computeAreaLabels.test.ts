import type { StatueLandmark } from "#src/models/world/StatueLandmark";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { LandmarkKind } from "#src/models/world/LandmarkKind";
import { computeAreaLabels } from "#src/services/map/computeAreaLabels";
import { readCatalogue } from "#src/services/world/readCatalogue";
import { describe, expect, test } from "vitest";

const catalogue = await readCatalogue(GAME_DATA_LOCAL_BASE_URL);

describe(computeAreaLabels, () => {
  test("names no area while no landmark is unlocked", () => {
    expect.hasAssertions();

    expect(computeAreaLabels(catalogue, [])).toStrictEqual([]);
  });

  test("names the area its unlocked landmark stands in, and no other", () => {
    expect.hasAssertions();

    const landmark: StatueLandmark = {
      areaId: "galesong-hill",
      heightOffset: 0,
      id: "",
      kind: LandmarkKind.StatueOfTheSeven,
      position: { x: 0, z: 0 },
      rotation: 0,
    };

    expect(computeAreaLabels(catalogue, [landmark]).map(({ id }) => id)).toStrictEqual(["galesong-hill"]);
  });
});
