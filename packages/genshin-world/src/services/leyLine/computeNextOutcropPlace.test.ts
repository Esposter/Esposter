import { computeNextOutcropPlace } from "#src/services/leyLine/computeNextOutcropPlace";
import { describe, expect, test } from "vitest";

describe(computeNextOutcropPlace, () => {
  const FIRST_PLACE_ID = 1;
  const SECOND_PLACE_ID = 2;
  const THIRD_PLACE_ID = 3;
  const placements = [
    { id: FIRST_PLACE_ID, position: { x: 0, z: 0 } },
    { id: SECOND_PLACE_ID, position: { x: 10, z: 0 } },
    { id: THIRD_PLACE_ID, position: { x: 3, z: 0 } },
  ];

  test("an outcrop moves to the nearest other place", () => {
    expect.hasAssertions();

    expect(computeNextOutcropPlace(placements, FIRST_PLACE_ID, undefined)).toBe(THIRD_PLACE_ID);
  });

  test("an outcrop moves past the place the other kind stands at to the next nearest", () => {
    expect.hasAssertions();

    expect(computeNextOutcropPlace(placements, FIRST_PLACE_ID, THIRD_PLACE_ID)).toBe(SECOND_PLACE_ID);
  });

  test("an outcrop stays where it is when no other place is free", () => {
    expect.hasAssertions();

    expect(computeNextOutcropPlace([placements[0]], FIRST_PLACE_ID, undefined)).toBeUndefined();
    expect(computeNextOutcropPlace(placements.slice(0, 2), FIRST_PLACE_ID, SECOND_PLACE_ID)).toBeUndefined();
  });
});
