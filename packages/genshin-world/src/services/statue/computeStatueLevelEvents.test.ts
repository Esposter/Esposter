import { AchievementEventKind } from "#src/models/achievement/AchievementEventKind";
import { computeStatueLevelEvents } from "#src/services/statue/computeStatueLevelEvents";
import { describe, expect, test } from "vitest";

describe(computeStatueLevelEvents, () => {
  test("a region's first resonance emits level one for its city", () => {
    expect.hasAssertions();

    expect(computeStatueLevelEvents("mondstadt", 0, 1, { mondstadt: 1 })).toStrictEqual([
      { kind: AchievementEventKind.StatueLevelReached, quantity: 1, targetId: "1" },
    ]);
  });

  test("a region whose level does not rise emits nothing", () => {
    expect.hasAssertions();

    expect(computeStatueLevelEvents("mondstadt", 3, 3, { mondstadt: 1 })).toStrictEqual([]);
  });

  test("a region's city is the one the joined city table names, whichever city that is", () => {
    expect.hasAssertions();

    expect(computeStatueLevelEvents("snezhnaya", 0, 1, { snezhnaya: 8 })).toStrictEqual([
      { kind: AchievementEventKind.StatueLevelReached, quantity: 1, targetId: "8" },
    ]);
  });

  test("a region with no city in the joined city table emits nothing", () => {
    expect.hasAssertions();

    expect(computeStatueLevelEvents("unmapped-region", 0, 1, { mondstadt: 1 })).toStrictEqual([]);
  });
});
