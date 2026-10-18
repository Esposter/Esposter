import type { ImaginariumDifficulty } from "#src/models/imaginarium/ImaginariumDifficulty";
import type { ImaginariumSeason } from "#src/models/imaginarium/ImaginariumSeason";

import { Element } from "#src/models/Element";
import { checkIsImaginariumCastEligible } from "#src/services/imaginarium/checkIsImaginariumCastEligible";
import { describe, expect, test } from "vitest";

describe(checkIsImaginariumCastEligible, () => {
  const EPOCH = new Date(0).toISOString().slice(0, 19);
  const season: ImaginariumSeason = {
    beginsAt: EPOCH,
    difficultyIds: [1],
    elements: [Element.Pyro, Element.Electro, Element.Cryo],
    endsAt: EPOCH,
    id: 1,
    openingCharacterIds: [1],
    rewardGroup: 1,
    specialGuestIds: [2],
  };
  const difficulty: ImaginariumDifficulty = { id: 1, level: 1, levelFloor: 60 };

  test("a character of a season element joins the Alternate Cast", () => {
    expect.hasAssertions();

    expect(
      checkIsImaginariumCastEligible(season, difficulty, { characterId: 3, element: Element.Cryo, level: 60 }),
    ).toBe(true);
  });

  test("a special guest of any element joins the Alternate Cast", () => {
    expect.hasAssertions();

    expect(
      checkIsImaginariumCastEligible(season, difficulty, { characterId: 2, element: Element.Hydro, level: 60 }),
    ).toBe(true);
  });

  test("a character off the season's elements is refused", () => {
    expect.hasAssertions();

    expect(
      checkIsImaginariumCastEligible(season, difficulty, { characterId: 3, element: Element.Hydro, level: 60 }),
    ).toBe(false);
  });

  test("a character below the level floor is refused", () => {
    expect.hasAssertions();

    expect(
      checkIsImaginariumCastEligible(season, difficulty, { characterId: 3, element: Element.Cryo, level: 59 }),
    ).toBe(false);
  });
});
