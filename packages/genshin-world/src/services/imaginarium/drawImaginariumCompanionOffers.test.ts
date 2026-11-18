import type { ImaginariumCastCandidate } from "#src/models/imaginarium/ImaginariumCastCandidate";
import type { ImaginariumDifficulty } from "#src/models/imaginarium/ImaginariumDifficulty";
import type { ImaginariumSeason } from "#src/models/imaginarium/ImaginariumSeason";

import { Element } from "#src/models/Element";
import { drawImaginariumCompanionOffers } from "#src/services/imaginarium/drawImaginariumCompanionOffers";
import { createSeededRandom } from "genshin-engine";
import { describe, expect, test } from "vitest";

describe(drawImaginariumCompanionOffers, () => {
  const EPOCH = new Date(0).toISOString().slice(0, 19);
  const season: ImaginariumSeason = {
    beginsAt: EPOCH,
    difficultyIds: [1],
    elements: [Element.Pyro, Element.Hydro, Element.Cryo],
    endsAt: EPOCH,
    id: 1,
    openingCharacterIds: [1],
    openingTrials: [],
    rewardGroup: 1,
    specialGuestIds: [],
  };
  const difficulty: ImaginariumDifficulty = { actCount: 3, alternateCastMinimum: 2, id: 1, level: 1, levelFloor: 60 };
  const candidates: ImaginariumCastCandidate[] = [
    { characterId: 10000001, element: Element.Pyro, level: 80 },
    { characterId: 10000002, element: Element.Hydro, level: 80 },
    { characterId: 10000003, element: Element.Pyro, level: 80 },
    { characterId: 10000004, element: Element.Pyro, level: 50 },
  ];

  test("a Companion event offers characters of its pool's element", () => {
    expect.hasAssertions();

    const offers = drawImaginariumCompanionOffers(
      { element: Element.Pyro, offerCount: 2 },
      season,
      difficulty,
      candidates,
      createSeededRandom(1),
    );

    expect(offers).toHaveLength(2);
    expect(offers.every(({ element }) => element === Element.Pyro)).toBe(true);
  });

  test("a Companion event offers only characters the season admits at the difficulty", () => {
    expect.hasAssertions();

    const offers = drawImaginariumCompanionOffers(
      { element: Element.Pyro, offerCount: 4 },
      season,
      difficulty,
      candidates,
      createSeededRandom(1),
    );

    expect(
      offers.map(({ characterId }) => characterId).toSorted((firstId, secondId) => firstId - secondId),
    ).toStrictEqual([10000001, 10000003]);
  });

  test("a Companion event with no pool element offers characters of any of the season's elements", () => {
    expect.hasAssertions();

    const offers = drawImaginariumCompanionOffers(
      { offerCount: 3 },
      season,
      difficulty,
      candidates,
      createSeededRandom(1),
    );

    expect(offers).toHaveLength(3);
    expect(new Set(offers.map(({ element }) => element))).toStrictEqual(new Set([Element.Hydro, Element.Pyro]));
  });

  test("a Companion event draws the same offers from the same seed", () => {
    expect.hasAssertions();

    const first = drawImaginariumCompanionOffers(
      { offerCount: 2 },
      season,
      difficulty,
      candidates,
      createSeededRandom(42),
    );
    const second = drawImaginariumCompanionOffers(
      { offerCount: 2 },
      season,
      difficulty,
      candidates,
      createSeededRandom(42),
    );

    expect(second).toStrictEqual(first);
  });
});
