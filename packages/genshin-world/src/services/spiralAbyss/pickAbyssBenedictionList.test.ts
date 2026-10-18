import type { AbyssBenedictionChoice } from "#src/models/spiralAbyss/AbyssBenedictionChoice";

import { pickAbyssBenedictionList } from "#src/services/spiralAbyss/pickAbyssBenedictionList";
import { describe, expect, test } from "vitest";

const MILLISECONDS_IN_DAY = 86_400_000;
const LISTS: AbyssBenedictionChoice[][] = [
  [{ descriptionTextHash: 1, towerBuffId: 1, weight: 100 }],
  [{ descriptionTextHash: 2, towerBuffId: 2, weight: 100 }],
  [{ descriptionTextHash: 3, towerBuffId: 3, weight: 100 }],
];
// The instant at the start of a game day counted from the epoch, which the game's daily hour falls inside
const atGameDay = (gameDay: number) => Temporal.Instant.fromEpochMilliseconds(gameDay * MILLISECONDS_IN_DAY);

describe(pickAbyssBenedictionList, () => {
  test("should offer the list its game day picks, one list after another as the days pass", () => {
    expect.hasAssertions();

    expect(pickAbyssBenedictionList(LISTS, atGameDay(0))).toStrictEqual(LISTS[0]);
    expect(pickAbyssBenedictionList(LISTS, atGameDay(1))).toStrictEqual(LISTS[1]);
    expect(pickAbyssBenedictionList(LISTS, atGameDay(3))).toStrictEqual(LISTS[0]);
  });
});
