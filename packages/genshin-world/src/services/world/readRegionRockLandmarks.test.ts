import type { RockRecord } from "#src/models/world/RockRecord";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { readMirroredGameDataObject } from "#scripts/gameData/mirror/readMirroredGameDataObject";
import { getGameDataRecord } from "#src/services/data/getGameDataRecord";
import { readRegionRockLandmarks, toRockLandmarks } from "#src/services/world/readRegionRockLandmarks";
import { jsonDateParse } from "@esposter/shared";
import { describe, expect, test } from "vitest";

// Inazuma's rocks record as the publish wrote it, read from the mirror the lock names
const readInazumaRockRecord = async (): Promise<RockRecord> => {
  const key = "regions/inazuma/rocks";
  return jsonDateParse(await readMirroredGameDataObject(getGameDataRecord(key)));
};

describe(readRegionRockLandmarks, () => {
  test("every rock stands at its placed position, turn and scale", async () => {
    expect.hasAssertions();

    const { placements } = await readInazumaRockRecord();
    const rocks = await readRegionRockLandmarks(GAME_DATA_LOCAL_BASE_URL, "inazuma");

    expect(rocks.map(({ place, scale, turn }) => ({ place, scale, turn }))).toStrictEqual(
      placements.map(({ position, rotation, scale }) => ({ place: position, scale, turn: rotation })),
    );
  });

  test("a rock the game does not place is not drawn", async () => {
    expect.hasAssertions();

    // A hull no placement stands is not drawn, and a region with no rocks record draws none
    const landmarks = toRockLandmarks("inazuma", {
      hulls: { placedRock: [[0, 0, 0, 1, 1, 1]], unplacedRock: [[0, 0, 0, 2, 2, 2]] },
      placements: [{ hull: "placedRock", position: [5, 0, 5], rotation: [0, 0, 0, 1], scale: [1, 1, 1] }],
    });

    expect(landmarks.map(({ boxes }) => boxes)).toStrictEqual([[[0, 0, 0, 1, 1, 1]]]);
    expect(landmarks.map(({ hull }) => hull)).toStrictEqual(["placedRock"]);
    await expect(readRegionRockLandmarks(GAME_DATA_LOCAL_BASE_URL, "mondstadt")).resolves.toStrictEqual([]);
  });
});
