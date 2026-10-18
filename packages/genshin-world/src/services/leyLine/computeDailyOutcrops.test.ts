import type { OutcropPlacement } from "#src/models/leyLine/OutcropPlacement";

import { OutcropKind } from "#src/models/leyLine/OutcropKind";
import { OutcropStage } from "#src/models/leyLine/OutcropStage";
import { computeDailyOutcrops } from "#src/services/leyLine/computeDailyOutcrops";
import { describe, expect, test } from "vitest";

describe(computeDailyOutcrops, () => {
  const FIRST_PLACE_ID = 11;
  const SECOND_PLACE_ID = 21;
  const kindRules = [
    { kind: OutcropKind.Revelation, playerLevel: 8, unlockCityIds: [], worldLevelRewards: [[]] },
    { kind: OutcropKind.Wealth, playerLevel: 30, unlockCityIds: [], worldLevelRewards: [[]] },
  ];
  const placements: OutcropPlacement[] = [
    { id: FIRST_PLACE_ID, position: { x: 0, z: 0 } },
    { id: SECOND_PLACE_ID, position: { x: 100, z: 0 } },
  ];

  test("the daily reset draws new places for open outcrops", () => {
    expect.hasAssertions();

    expect(computeDailyOutcrops(kindRules, placements, 30, [], () => 0)).toStrictEqual([
      { kind: OutcropKind.Revelation, placeId: FIRST_PLACE_ID, stage: OutcropStage.Waiting },
      { kind: OutcropKind.Wealth, placeId: SECOND_PLACE_ID, stage: OutcropStage.Waiting },
    ]);
    expect(computeDailyOutcrops(kindRules, placements, 30, [], () => 0.99)).toStrictEqual([
      { kind: OutcropKind.Revelation, placeId: SECOND_PLACE_ID, stage: OutcropStage.Waiting },
      { kind: OutcropKind.Wealth, placeId: FIRST_PLACE_ID, stage: OutcropStage.Waiting },
    ]);
  });

  test("a kind below its rank starts none, and a kind with no place left starts none", () => {
    expect.hasAssertions();

    expect(computeDailyOutcrops(kindRules, placements, 8, [], () => 0)).toStrictEqual([
      { kind: OutcropKind.Revelation, placeId: FIRST_PLACE_ID, stage: OutcropStage.Waiting },
    ]);
    expect(computeDailyOutcrops(kindRules, [placements[0]], 30, [], () => 0)).toStrictEqual([
      { kind: OutcropKind.Revelation, placeId: FIRST_PLACE_ID, stage: OutcropStage.Waiting },
    ]);
  });
});
