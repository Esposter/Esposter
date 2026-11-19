import type { ImaginariumCastCandidate } from "#src/models/imaginarium/ImaginariumCastCandidate";
import type { ImaginariumDifficulty } from "#src/models/imaginarium/ImaginariumDifficulty";
import type { ImaginariumSeason } from "#src/models/imaginarium/ImaginariumSeason";

import { Element } from "#src/models/Element";
import { IMAGINARIUM_INVITE_COMPANION_EVENT } from "#src/services/imaginarium/constants";
import { takeImaginariumCompanionEvent } from "#src/services/imaginarium/takeImaginariumCompanionEvent";
import { createSeededRandom } from "genshin-engine";
import { describe, expect, test } from "vitest";

describe(takeImaginariumCompanionEvent, () => {
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
    { characterId: 10000003, element: Element.Cryo, level: 80 },
    { characterId: 10000004, element: Element.Pyro, level: 80 },
    { characterId: 10000005, element: Element.Hydro, level: 80 },
    { characterId: 10000006, element: Element.Cryo, level: 80 },
  ];

  test("a Companion event costs Fantasia Flowers", () => {
    expect.hasAssertions();

    const { flowerPrice } = IMAGINARIUM_INVITE_COMPANION_EVENT;

    expect(
      takeImaginariumCompanionEvent(
        IMAGINARIUM_INVITE_COMPANION_EVENT,
        flowerPrice,
        season,
        difficulty,
        candidates,
        createSeededRandom(1),
      ),
    ).toStrictEqual({
      flowers: 0,
      isTaken: true,
      offers: [
        { characterId: 10000002, element: Element.Hydro, level: 80 },
        { characterId: 10000006, element: Element.Cryo, level: 80 },
        { characterId: 10000003, element: Element.Cryo, level: 80 },
        { characterId: 10000001, element: Element.Pyro, level: 80 },
        { characterId: 10000005, element: Element.Hydro, level: 80 },
        { characterId: 10000004, element: Element.Pyro, level: 80 },
      ],
    });
  });

  test("a paid event is refused without enough Fantasia Flowers", () => {
    expect.hasAssertions();

    const flowers = IMAGINARIUM_INVITE_COMPANION_EVENT.flowerPrice - 1;

    expect(
      takeImaginariumCompanionEvent(
        IMAGINARIUM_INVITE_COMPANION_EVENT,
        flowers,
        season,
        difficulty,
        candidates,
        createSeededRandom(1),
      ),
    ).toStrictEqual({ flowers, isTaken: false, offers: [] });
  });
});
