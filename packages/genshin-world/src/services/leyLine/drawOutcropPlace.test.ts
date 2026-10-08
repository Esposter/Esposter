import { drawOutcropPlace } from "#src/services/leyLine/drawOutcropPlace";
import { describe, expect, test } from "vitest";

describe(drawOutcropPlace, () => {
  const FIRST_SECTION_ID = 1;
  const SECOND_SECTION_ID = 2;
  const FIRST_PLACE_ID = 11;
  const SECOND_PLACE_ID = 12;
  const SECOND_SECTION_PLACE_ID = 21;
  const region = {
    kinds: [],
    places: [
      { id: SECOND_PLACE_ID, nextIds: [], sectionId: FIRST_SECTION_ID },
      { id: FIRST_PLACE_ID, nextIds: [SECOND_PLACE_ID], sectionId: FIRST_SECTION_ID },
      { id: SECOND_SECTION_PLACE_ID, nextIds: [], sectionId: SECOND_SECTION_ID },
    ],
    sectionIds: [FIRST_SECTION_ID, SECOND_SECTION_ID],
  };

  test("a section drawn starts at its lowest numbered place", () => {
    expect.hasAssertions();

    expect(drawOutcropPlace(region, () => 0)).toBe(FIRST_PLACE_ID);
    expect(drawOutcropPlace(region, () => 0.99)).toBe(SECOND_SECTION_PLACE_ID);
  });

  test("a region with no section to draw starts no outcrop", () => {
    expect.hasAssertions();

    expect(drawOutcropPlace({ ...region, sectionIds: [] }, () => 0)).toBeUndefined();
  });
});
