import { checkIsOpeningElementsMatched } from "#src/services/genshinAssets/imaginarium/checkIsOpeningElementsMatched";
import { Element } from "genshin-world";
import { describe, expect, test } from "vitest";

describe(checkIsOpeningElementsMatched, () => {
  const elements = [Element.Pyro, Element.Electro, Element.Cryo];

  test("a season whose openers' elements are its three passes the data run", () => {
    expect.hasAssertions();

    expect(
      checkIsOpeningElementsMatched(elements, [
        Element.Pyro,
        Element.Pyro,
        Element.Electro,
        Element.Electro,
        Element.Cryo,
        Element.Cryo,
      ]),
    ).toBe(true);
  });

  test("a season whose openers' elements differ fails the data run", () => {
    expect.hasAssertions();

    expect(
      checkIsOpeningElementsMatched(elements, [
        Element.Pyro,
        Element.Pyro,
        Element.Electro,
        Element.Electro,
        Element.Hydro,
        Element.Hydro,
      ]),
    ).toBe(false);
  });
});
