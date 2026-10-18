import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { ABYSS_CORRIDOR_LAST_FLOOR_INDEX } from "#src/services/spiralAbyss/constants";
import { getAbyssFloorsOffered } from "#src/services/spiralAbyss/getAbyssFloorsOffered";
import { readAbyssFloors } from "#src/services/spiralAbyss/readAbyssFloors";
import { readAbyssPeriods } from "#src/services/spiralAbyss/readAbyssPeriods";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const floors = await readAbyssFloors(GAME_DATA_LOCAL_BASE_URL);
const periods = await readAbyssPeriods(GAME_DATA_LOCAL_BASE_URL);
// The latest period the record holds, whose floors the Moon Spire offers now
const period = takeOne(periods, periods.length - 1);

describe(getAbyssFloorsOffered, () => {
  test("a period offers its own floors", () => {
    expect.hasAssertions();

    expect(getAbyssFloorsOffered(floors, period).map(({ id }) => id)).toStrictEqual(period.floorIds);
  });

  test("with no period, the Corridor's floors are offered", () => {
    expect.hasAssertions();

    expect(getAbyssFloorsOffered(floors, undefined).map(({ id }) => id)).toStrictEqual(
      floors.filter(({ index }) => index <= ABYSS_CORRIDOR_LAST_FLOOR_INDEX).map(({ id }) => id),
    );
  });
});
