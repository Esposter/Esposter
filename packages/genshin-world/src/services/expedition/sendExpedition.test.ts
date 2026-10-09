import type { Expedition } from "#src/models/expedition/Expedition";
import type { ExpeditionContext } from "#src/models/expedition/ExpeditionContext";
import type { ExpeditionPlace } from "#src/models/expedition/ExpeditionPlace";

import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { EXPEDITION_UNLOCK_RANK } from "#src/services/expedition/constants";
import { sendExpedition } from "#src/services/expedition/sendExpedition";
import { GameTextKey } from "genshin-text";
import { describe, expect, test } from "vitest";

describe(sendExpedition, () => {
  const CHARACTER_ID = 10_000_001;
  const PLACE_ID = 102;
  const HOURS = 4;
  const EXPEDITION_LIMIT = 2;
  const place: ExpeditionPlace = {
    durations: [{ hours: HOURS, items: [] }],
    id: PLACE_ID,
    nameTextId: GameTextKey.Windrise,
    questId: "",
    rankLevel: EXPEDITION_UNLOCK_RANK,
    statuePointId: 0,
  };
  const context: ExpeditionContext = {
    adventureRank: EXPEDITION_UNLOCK_RANK,
    completedQuestIds: new Set(),
    expeditionLimit: EXPEDITION_LIMIT,
    isCharacterDown: false,
    now: Temporal.Instant.fromEpochMilliseconds(0),
    unlockedStatuePointIds: new Set(),
  };

  test("should send a character for an offered length of time, leaving at the moment given", () => {
    expect.hasAssertions();

    expect(sendExpedition([], CHARACTER_ID, place, HOURS, context)).toStrictEqual([
      { characterId: CHARACTER_ID, hours: HOURS, leftAt: context.now, placeId: PLACE_ID },
    ]);
  });

  test("should refuse the Traveler, a character down and one already away", () => {
    expect.hasAssertions();

    const away: Expedition[] = [{ characterId: CHARACTER_ID, hours: HOURS, leftAt: context.now, placeId: PLACE_ID }];

    expect(sendExpedition([], TRAVELER_CHARACTER_ID, place, HOURS, context)).toBeUndefined();
    expect(sendExpedition([], CHARACTER_ID, place, HOURS, { ...context, isCharacterDown: true })).toBeUndefined();
    expect(sendExpedition(away, CHARACTER_ID, place, HOURS, context)).toBeUndefined();
  });

  test("should refuse past the limit, below the rank, and hours the place does not offer", () => {
    expect.hasAssertions();

    const full: Expedition[] = [
      { characterId: 1, hours: HOURS, leftAt: context.now, placeId: PLACE_ID },
      { characterId: 2, hours: HOURS, leftAt: context.now, placeId: PLACE_ID },
    ];

    expect(sendExpedition(full, CHARACTER_ID, place, HOURS, context)).toBeUndefined();
    expect(
      sendExpedition([], CHARACTER_ID, place, HOURS, { ...context, adventureRank: EXPEDITION_UNLOCK_RANK - 1 }),
    ).toBeUndefined();
    expect(sendExpedition([], CHARACTER_ID, place, HOURS * 2, context)).toBeUndefined();
  });
});
