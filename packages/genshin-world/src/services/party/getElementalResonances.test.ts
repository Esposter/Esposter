import { Element } from "#src/models/Element";
import { getElementalResonances } from "#src/services/party/getElementalResonances";
import { describe, expect, test } from "vitest";

describe(getElementalResonances, () => {
  test("gives each element two or more members of a full team share, in the game's order", () => {
    expect.hasAssertions();

    expect(getElementalResonances([Element.Hydro, Element.Pyro, Element.Hydro, Element.Pyro])).toStrictEqual([
      Element.Pyro,
      Element.Hydro,
    ]);
  });

  test("gives none to a team not full, or a full team with no two of an element", () => {
    expect.hasAssertions();

    expect([
      getElementalResonances([Element.Pyro, Element.Pyro, Element.Pyro]),
      getElementalResonances([Element.Pyro, Element.Hydro, Element.Anemo, Element.Geo]),
    ]).toStrictEqual([[], []]);
  });
});
