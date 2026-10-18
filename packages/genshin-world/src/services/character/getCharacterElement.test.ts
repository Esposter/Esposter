import { Element } from "#src/models/Element";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { getCharacterElement } from "#src/services/character/getCharacterElement";
import { describe, expect, test } from "vitest";

describe(getCharacterElement, () => {
  const CHARACTER_ID = 1;
  const CHARACTER_DATA_MAP = new Map([[CHARACTER_ID, { element: Element.Pyro }]]);

  test("the element mark shows the chosen character's element", () => {
    expect.hasAssertions();

    expect(getCharacterElement(CHARACTER_ID, CHARACTER_DATA_MAP, Element.Hydro)).toBe(Element.Pyro);
  });

  test("the Traveler's mark shows its alignment", () => {
    expect.hasAssertions();

    expect(getCharacterElement(TRAVELER_CHARACTER_ID, CHARACTER_DATA_MAP, Element.Hydro)).toBe(Element.Hydro);
    expect(getCharacterElement(TRAVELER_CHARACTER_ID, CHARACTER_DATA_MAP, undefined)).toBeUndefined();
  });
});
