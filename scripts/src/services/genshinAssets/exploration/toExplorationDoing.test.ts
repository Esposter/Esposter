import type { ExcelWorldAreaExploreEventRow } from "#src/models/genshinAssets/exploration/ExcelWorldAreaExploreEventRow";

import { toExplorationDoing } from "#src/services/genshinAssets/exploration/toExplorationDoing";
import { ExplorationKind } from "genshin-world";
import { describe, expect, test } from "vitest";

describe(toExplorationDoing, () => {
  const EVENT_ID = 40;
  const WEIGHT = 10;
  const toRow = (EventType: string): ExcelWorldAreaExploreEventRow => ({
    AreaID: 2,
    EventID: EVENT_ID,
    EventType,
    ExploreWeight: WEIGHT,
    Param: ["4", "", ""],
    SceneID: 3,
  });

  test("should read a waypoint's, a chest's and a camp's events as their kinds, keyed by the event's id", () => {
    expect.hasAssertions();

    expect(toExplorationDoing(toRow("EXPLORE_EVENT_UNLOCK_POINT"))).toStrictEqual({
      id: String(EVENT_ID),
      kind: ExplorationKind.Waypoint,
      weight: WEIGHT,
    });
    expect(toExplorationDoing(toRow("EXPLORE_EVENT_OPEN_CHEST"))?.kind).toBe(ExplorationKind.Chest);
    expect(toExplorationDoing(toRow("EXPLORE_EVENT_CLEAR_GROUP_MONSTER"))?.kind).toBe(ExplorationKind.Camp);
  });

  test("should leave out an event whose type the progress does not count", () => {
    expect.hasAssertions();

    expect(toExplorationDoing(toRow("EXPLORE_EVENT_ITEM_ADD"))).toBeUndefined();
  });
});
