import type { RockRecord } from "#src/models/world/RockRecord";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { readMirroredGameDataObject } from "#scripts/gameData/mirror/readMirroredGameDataObject";
import { gameDataLock } from "#src/services/data/gameDataLock";
import { readRegionRockLandmarks, toRockLandmarks } from "#src/services/world/readRegionRockLandmarks";
import { jsonDateParse, takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

// Inazuma's rocks record as the publish wrote it, read from the mirror the lock names
const readInazumaRockRecord = async (): Promise<RockRecord> => {
  const key = "regions/inazuma/rocks";
  return jsonDateParse(await readMirroredGameDataObject(key, takeOne(gameDataLock.objects, key)));
};

describe(readRegionRockLandmarks, () => {
  test("a rock stands at its placed position", async () => {
    expect.hasAssertions();

    const { placements } = await readInazumaRockRecord();
    const [rock] = await readRegionRockLandmarks(GAME_DATA_LOCAL_BASE_URL, "inazuma");

    expect(rock?.place).toStrictEqual(placements[0]?.position);
    expect(rock?.turn).toStrictEqual(placements[0]?.rotation);
    expect(rock?.scale).toStrictEqual(placements[0]?.scale);
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
