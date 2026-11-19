import { AchievementEventKind } from "#src/models/achievement/AchievementEventKind";
import { computeStatueLevelEvents } from "#src/services/statue/computeStatueLevelEvents";
import { describe, expect, test } from "vitest";

describe(computeStatueLevelEvents, () => {
  test.each([
    ["mondstadt", 1, "1"],
    ["snezhnaya", 8, "8"],
  ])("a region's first resonance emits level one for its city, %s", (regionId, cityId, targetId) => {
    expect.hasAssertions();

    expect(computeStatueLevelEvents(regionId, 0, 1, { [regionId]: cityId })).toStrictEqual([
      { kind: AchievementEventKind.StatueLevelReached, quantity: 1, targetId },
    ]);
  });

  test("a region whose level does not rise emits nothing", () => {
    expect.hasAssertions();

    expect(computeStatueLevelEvents("mondstadt", 3, 3, { mondstadt: 1 })).toStrictEqual([]);
  });

  test("a region with no city in the joined city table emits nothing", () => {
    expect.hasAssertions();

    expect(computeStatueLevelEvents("unmapped-region", 0, 1, { mondstadt: 1 })).toStrictEqual([]);
  });
});
