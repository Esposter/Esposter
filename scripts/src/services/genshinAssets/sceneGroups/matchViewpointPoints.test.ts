import { matchViewpointPoints } from "#src/services/genshinAssets/sceneGroups/matchViewpointPoints";
import { describe, expect, test } from "vitest";

describe(matchViewpointPoints, () => {
  test("takes the point whose text holds the name as whole words, whatever its case and apostrophes", () => {
    expect.hasAssertions();

    expect(
      matchViewpointPoints(
        new Map([
          [1, "Tatara Islands Vantage Point"],
          [2, "Shut"],
        ]),
        new Map([
          [10, "Kannazuka: Tatara Island's Vantage Point"],
          [11, "Shutter"],
        ]),
      ),
    ).toStrictEqual(new Map([[1, 10]]));
  });

  test("takes points by elimination when one viewpoint's name is written beside another's", () => {
    expect.hasAssertions();

    expect(
      matchViewpointPoints(
        new Map([
          [1, "The Mausoleum of King Deshret"],
          [2, "Aaru's Shut"],
        ]),
        new Map([
          [10, "The Mausoleum of King Deshret"],
          [11, "The Mausoleum of King Deshret: Aaru's Shut, on the top"],
        ]),
      ),
    ).toStrictEqual(
      new Map([
        [1, 10],
        [2, 11],
      ]),
    );
  });

  test("leaves a viewpoint named on several points, or sharing its one point, unmatched", () => {
    expect.hasAssertions();

    expect(
      matchViewpointPoints(
        new Map([
          [1, "Scenery Within Elynas' Deepest Depths"],
          [2, "Safhe Shatranj"],
          [3, "Safhe Shatranj"],
        ]),
        new Map([
          [10, "A very warm place: Scenery Within Elynas' Deepest Depths"],
          [11, "Scenery Within Elynas' Deepest Depths, after the questline"],
          [12, "Safhe Shatranj"],
        ]),
      ),
    ).toStrictEqual(new Map());
  });
});
