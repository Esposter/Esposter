import { OutcropKind } from "#src/models/leyLine/OutcropKind";
import { OutcropStage } from "#src/models/leyLine/OutcropStage";
import { computeDailyOutcrops } from "#src/services/leyLine/computeDailyOutcrops";
import { describe, expect, test } from "vitest";

describe(computeDailyOutcrops, () => {
  const FIRST_SECTION_ID = 1;
  const SECOND_SECTION_ID = 2;
  const FIRST_PLACE_ID = 11;
  const SECOND_SECTION_PLACE_ID = 21;
  const region = {
    kinds: [
      { kind: OutcropKind.Revelation, playerLevel: 8, unlockCityIds: [] },
      { kind: OutcropKind.Wealth, playerLevel: 30, unlockCityIds: [] },
    ],
    places: [
      { id: FIRST_PLACE_ID, nextIds: [], sectionId: FIRST_SECTION_ID },
      { id: SECOND_SECTION_PLACE_ID, nextIds: [], sectionId: SECOND_SECTION_ID },
    ],
    sectionIds: [FIRST_SECTION_ID, SECOND_SECTION_ID],
  };

  test("the daily reset draws new places for open outcrops", () => {
    expect.hasAssertions();

    expect(computeDailyOutcrops(region, 8, [], () => 0)).toStrictEqual([
      { kind: OutcropKind.Revelation, placeId: FIRST_PLACE_ID, stage: OutcropStage.Waiting },
    ]);
    expect(computeDailyOutcrops(region, 8, [], () => 0.99)).toStrictEqual([
      { kind: OutcropKind.Revelation, placeId: SECOND_SECTION_PLACE_ID, stage: OutcropStage.Waiting },
    ]);
  });
});
