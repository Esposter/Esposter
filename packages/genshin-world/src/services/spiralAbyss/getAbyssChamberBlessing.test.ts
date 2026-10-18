import type { AbyssFloor } from "#src/models/spiralAbyss/AbyssFloor";
import type { AbyssPeriod } from "#src/models/spiralAbyss/AbyssPeriod";

import { getAbyssChamberBlessing } from "#src/services/spiralAbyss/getAbyssChamberBlessing";
import { GAME_TIME_ZONE } from "#src/services/time/constants";
import { describe, expect, test } from "vitest";

const MILLISECONDS_IN_DAY = 86_400_000;
const CORRIDOR_FLOOR_ID = 1;
const MOON_SPIRE_FLOOR_ID = 9;
const BLESSING = { descriptionTextHash: 1, icon: "UI_TowerBlessing_107", nameTextHash: 2 };
const LISTS = [
  [{ descriptionTextHash: 1, towerBuffId: 1, weight: 100 }],
  [{ descriptionTextHash: 2, towerBuffId: 2, weight: 100 }],
  [{ descriptionTextHash: 3, towerBuffId: 3, weight: 100 }],
];
// The epoch's game time, a period of thirty days from it, and the second game day as the moment both are read at
const GAME_EPOCH = Temporal.Instant.fromEpochMilliseconds(0).toZonedDateTimeISO(GAME_TIME_ZONE).toPlainDateTime();
const PERIOD: AbyssPeriod = {
  blessing: BLESSING,
  closesAt: GAME_EPOCH.add({ days: 30 }).toString(),
  floorIds: [9, 10, 11, 12],
  id: 1,
  rewardGroup: 1,
  startsAt: GAME_EPOCH.toString(),
};
const NOW = Temporal.Instant.fromEpochMilliseconds(MILLISECONDS_IN_DAY);
const createFloor = (id: number, index: number): AbyssFloor => ({
  chambers: [],
  id,
  index,
  teamCount: 1,
  unlockStarCount: 6,
});

describe(getAbyssChamberBlessing, () => {
  test("should show the period's blessing in a Moon Spire chamber", () => {
    expect.hasAssertions();

    expect(getAbyssChamberBlessing(createFloor(MOON_SPIRE_FLOOR_ID, 9), [PERIOD], LISTS, NOW)).toStrictEqual({
      blessing: BLESSING,
      kind: "period",
    });
  });

  test("should offer a Corridor chamber the Benedictions of the list its game day picks", () => {
    expect.hasAssertions();

    expect(getAbyssChamberBlessing(createFloor(CORRIDOR_FLOOR_ID, 1), [PERIOD], LISTS, NOW)).toStrictEqual({
      choices: LISTS[1],
      kind: "choices",
    });
  });
});
