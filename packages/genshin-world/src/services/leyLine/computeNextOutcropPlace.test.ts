import { computeNextOutcropPlace } from "#src/services/leyLine/computeNextOutcropPlace";
import { describe, expect, test } from "vitest";

describe(computeNextOutcropPlace, () => {
  const FIRST_PLACE_ID = 1;
  const SECOND_PLACE_ID = 2;
  const THIRD_PLACE_ID = 3;
  const region = {
    kinds: [],
    places: [
      { id: FIRST_PLACE_ID, nextIds: [SECOND_PLACE_ID], sectionId: 1 },
      { id: SECOND_PLACE_ID, nextIds: [THIRD_PLACE_ID], sectionId: 1 },
      { id: THIRD_PLACE_ID, nextIds: [], sectionId: 1 },
    ],
    sectionIds: [1],
  };

  test("an outcrop moves to the next place it is listed to move to", () => {
    expect.hasAssertions();

    expect(computeNextOutcropPlace(region, FIRST_PLACE_ID, undefined)).toBe(SECOND_PLACE_ID);
    expect(computeNextOutcropPlace(region, FIRST_PLACE_ID, THIRD_PLACE_ID)).toBe(SECOND_PLACE_ID);
  });

  test("an outcrop moves to the place after the next when the other kind stands at the next", () => {
    expect.hasAssertions();

    expect(computeNextOutcropPlace(region, FIRST_PLACE_ID, SECOND_PLACE_ID)).toBe(THIRD_PLACE_ID);
  });

  test("an outcrop stays where it is when it has no place to move to, or the one after is none", () => {
    expect.hasAssertions();

    expect(computeNextOutcropPlace(region, THIRD_PLACE_ID, undefined)).toBeUndefined();
    expect(computeNextOutcropPlace(region, SECOND_PLACE_ID, THIRD_PLACE_ID)).toBeUndefined();
  });
});
