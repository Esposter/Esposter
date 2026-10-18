import type { ExplorationArea } from "#src/models/exploration/ExplorationArea";
import type { Catalogue } from "#src/models/world/Catalogue";

import { ExplorationKind } from "#src/models/exploration/ExplorationKind";
import { WorldLayer } from "#src/models/world/WorldLayer";
import { computeExplorationProgress } from "#src/services/exploration/computeExplorationProgress";
import { computeExploredDoingIds } from "#src/services/exploration/computeExploredDoingIds";
import { ExplorationKindWeightMap } from "#src/services/exploration/ExplorationKindWeightMap";
import { placeExplorationDoings } from "#src/services/exploration/placeExplorationDoings";
import { describe, expect, test } from "vitest";

describe(placeExplorationDoings, () => {
  const AREA_ID = "made-up-area";
  // A made-up square of catalogue area: a point inside it stands in the area, one past it stands in none
  const catalogue: Catalogue = {
    regions: [
      {
        areas: [
          {
            id: AREA_ID,
            layer: WorldLayer.Surface,
            name: "Made-up Area",
            outline: [
              { x: 0, z: 0 },
              { x: 100, z: 0 },
              { x: 100, z: 100 },
              { x: 0, z: 100 },
            ],
            subareas: [],
            subregion: "",
            weathers: [],
          },
        ],
        id: "made-up-region",
        name: "Made-up Region",
      },
    ],
  };
  const area: ExplorationArea = { areaId: AREA_ID, doings: [], reputationRatio: 0, total: 100 };
  const CHEST = { id: "made-up-chest", kind: ExplorationKind.Chest, position: { x: 10, z: 10 } };
  const OCULUS = { id: "made-up-oculus", kind: ExplorationKind.Oculus, position: { x: 20, z: 20 } };
  const PUZZLE = { id: "made-up-puzzle", kind: ExplorationKind.Puzzle, position: { x: 30, z: 30 } };

  test("an opened chest adds its kind's weight to its area", () => {
    expect.hasAssertions();

    // Each kind's weight is a tenth of the made-up area's total, so each done doing reads its weight in percent
    const placedAreas = placeExplorationDoings([area], catalogue, [CHEST, OCULUS, PUZZLE]);
    const progressOf = (recordedDoingIds: string[]) =>
      placedAreas.map((placedArea) =>
        computeExplorationProgress(placedArea, computeExploredDoingIds(placedArea, [], new Set(recordedDoingIds))),
      );
    const chestWeight = ExplorationKindWeightMap[ExplorationKind.Chest];

    expect([
      progressOf([]),
      progressOf([CHEST.id]),
      progressOf([CHEST.id, OCULUS.id]),
      progressOf([CHEST.id, OCULUS.id, PUZZLE.id]),
    ]).toStrictEqual([
      [0],
      [chestWeight],
      [chestWeight + ExplorationKindWeightMap[ExplorationKind.Oculus]],
      [
        chestWeight +
          ExplorationKindWeightMap[ExplorationKind.Oculus] +
          ExplorationKindWeightMap[ExplorationKind.Puzzle],
      ],
    ]);
  });

  test("a doing standing in no listed area adds to none", () => {
    expect.hasAssertions();

    const outsideChest = { ...CHEST, position: { x: 1000, z: 1000 } };
    const [placedArea] = placeExplorationDoings([area], catalogue, [outsideChest]);

    expect(placedArea?.doings).toStrictEqual([]);
  });
});
