import { Element } from "#src/models/Element";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { getDeployedElements } from "#src/services/party/getDeployedElements";
import { describe, expect, test } from "vitest";

describe(getDeployedElements, () => {
  test("reads each member's element from its published record, in the team's order", () => {
    expect.hasAssertions();

    expect(
      getDeployedElements(
        [10_000_084, 10_000_003],
        new Map([
          [10_000_084, { element: Element.Pyro }],
          [10_000_003, { element: Element.Anemo }],
        ]),
        undefined,
      ),
    ).toStrictEqual([Element.Pyro, Element.Anemo]);
  });

  test("reads the Traveler's element from the one he holds now, and holds none while he holds none", () => {
    expect.hasAssertions();

    expect(getDeployedElements([TRAVELER_CHARACTER_ID], new Map(), Element.Hydro)).toStrictEqual([Element.Hydro]);
    expect(getDeployedElements([TRAVELER_CHARACTER_ID], new Map(), undefined)).toStrictEqual([undefined]);
  });
});
