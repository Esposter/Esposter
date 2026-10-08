import type { ExpeditionPlace } from "#src/models/expedition/ExpeditionPlace";

import { checkIsExpeditionPlaceOpen } from "#src/services/expedition/checkIsExpeditionPlaceOpen";
import { GameTextKey } from "genshin-text";
import { describe, expect, test } from "vitest";

describe(checkIsExpeditionPlaceOpen, () => {
  const RANK_LEVEL = 14;
  const STATUE_POINT_ID = 4;
  const QUEST_ID = "39604";
  const place: ExpeditionPlace = {
    durations: [],
    id: 102,
    nameTextId: GameTextKey.Windrise,
    questId: "",
    rankLevel: RANK_LEVEL,
    statuePointId: STATUE_POINT_ID,
  };
  const unlockedStatuePointIds: ReadonlySet<number> = new Set([STATUE_POINT_ID]);

  test("should open a place once its rank is reached and its statue resonated with", () => {
    expect.hasAssertions();

    expect(
      checkIsExpeditionPlaceOpen(place, {
        adventureRank: RANK_LEVEL,
        completedQuestIds: new Set(),
        unlockedStatuePointIds,
      }),
    ).toBe(true);
  });

  test("should keep a place closed below its rank", () => {
    expect.hasAssertions();

    expect(
      checkIsExpeditionPlaceOpen(place, {
        adventureRank: RANK_LEVEL - 1,
        completedQuestIds: new Set(),
        unlockedStatuePointIds,
      }),
    ).toBe(false);
  });

  test("should keep a place closed until its statue is resonated with", () => {
    expect.hasAssertions();

    expect(
      checkIsExpeditionPlaceOpen(place, {
        adventureRank: RANK_LEVEL,
        completedQuestIds: new Set(),
        unlockedStatuePointIds: new Set(),
      }),
    ).toBe(false);
  });

  test("should keep a place closed until its quest is finished", () => {
    expect.hasAssertions();

    const questPlace: ExpeditionPlace = { ...place, questId: QUEST_ID, statuePointId: 0 };

    expect(
      checkIsExpeditionPlaceOpen(questPlace, {
        adventureRank: RANK_LEVEL,
        completedQuestIds: new Set(),
        unlockedStatuePointIds: new Set(),
      }),
    ).toBe(false);
    expect(
      checkIsExpeditionPlaceOpen(questPlace, {
        adventureRank: RANK_LEVEL,
        completedQuestIds: new Set([QUEST_ID]),
        unlockedStatuePointIds: new Set(),
      }),
    ).toBe(true);
  });
});
