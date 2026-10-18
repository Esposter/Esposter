import type { StatueProgressSave } from "#src/models/statue/StatueProgressSave";

import { ExpeditionRegion } from "#src/models/expedition/ExpeditionRegion";
import { checkIsExpeditionPlaceOpen } from "#src/services/expedition/checkIsExpeditionPlaceOpen";
import { computeUnlockedStatuePointIds } from "#src/services/statue/computeUnlockedStatuePointIds";
import { GameTextKey } from "genshin-text";
import { describe, expect, test } from "vitest";

describe(computeUnlockedStatuePointIds, () => {
  const RANK_LEVEL = 14;
  const STATUE_POINT_ID = 4;
  const place = {
    durations: [],
    id: 102,
    nameTextId: GameTextKey.Windrise,
    questId: "",
    rankLevel: RANK_LEVEL,
    region: ExpeditionRegion.Mondstadt,
    statuePointId: STATUE_POINT_ID,
  };
  const isPlaceOpen = (regions: StatueProgressSave["regions"]) =>
    checkIsExpeditionPlaceOpen(place, {
      adventureRank: RANK_LEVEL,
      completedQuestIds: new Set(),
      unlockedStatuePointIds: computeUnlockedStatuePointIds(regions),
    });

  test("a place opens when its statue is resonated", () => {
    expect.hasAssertions();

    expect(isPlaceOpen({ mondstadt: { heldCount: 0, level: 1 } })).toBe(true);
  });

  test("a place whose statue is not resonated stays closed", () => {
    expect.hasAssertions();

    expect([isPlaceOpen({ mondstadt: { heldCount: 0, level: 0 } }), isPlaceOpen({})]).toStrictEqual([false, false]);
  });
});
