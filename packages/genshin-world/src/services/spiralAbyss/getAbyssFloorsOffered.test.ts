import type { AbyssFloor } from "#src/models/spiralAbyss/AbyssFloor";
import type { AbyssPeriod } from "#src/models/spiralAbyss/AbyssPeriod";

import { getAbyssFloorsOffered } from "#src/services/spiralAbyss/getAbyssFloorsOffered";
import { describe, expect, test } from "vitest";

const floor = (id: number, index: number): AbyssFloor => ({
  chambers: [],
  id,
  index,
  teamCount: 2,
  unlockStarCount: 0,
});
const floors = [floor(1001, 1), floor(1008, 8), floor(1134, 9), floor(1135, 10), floor(1140, 11)];
const period: AbyssPeriod = {
  blessing: { descriptionTextHash: 2415435448, icon: "UI_TowerBlessing_107", nameTextHash: 1867767671 },
  closesAt: new Date(0).toISOString(),
  floorIds: [1134, 1135, 1140, 1141],
  id: 124,
  rewardGroup: 1,
  startsAt: new Date(0).toISOString(),
};

describe(getAbyssFloorsOffered, () => {
  test("a period offers its own floors", () => {
    expect.hasAssertions();

    expect(getAbyssFloorsOffered(floors, period).map(({ id }) => id)).toStrictEqual([1134, 1135, 1140]);
  });

  test("with no period, the Corridor's floors are offered", () => {
    expect.hasAssertions();

    expect(getAbyssFloorsOffered(floors, undefined).map(({ id }) => id)).toStrictEqual([1001, 1008]);
  });
});
