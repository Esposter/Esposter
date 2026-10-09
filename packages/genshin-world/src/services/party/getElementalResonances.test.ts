import { Element } from "#src/models/Element";
import { SpecialResonance } from "#src/models/party/SpecialResonance";
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

  test("gives the Protective Canopy to a full team of four unique elements, and none to a team not full", () => {
    expect.hasAssertions();

    expect([
      getElementalResonances([Element.Pyro, Element.Hydro, Element.Anemo, Element.Geo]),
      getElementalResonances([Element.Pyro, Element.Pyro, Element.Pyro]),
    ]).toStrictEqual([[SpecialResonance.ProtectiveCanopy], []]);
  });
});
