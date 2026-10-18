import { AchievementEventKind } from "#src/models/achievement/AchievementEventKind";
import { computeStatueLevelEvents } from "#src/services/statue/computeStatueLevelEvents";
import { describe, expect, test } from "vitest";

describe(computeStatueLevelEvents, () => {
  test("a region's first resonance emits level one for its city", () => {
    expect.hasAssertions();

    expect(computeStatueLevelEvents("mondstadt", 0, 1)).toStrictEqual([
      { kind: AchievementEventKind.StatueLevelReached, quantity: 1, targetId: "1" },
    ]);
  });

  test("a region whose level does not rise emits nothing", () => {
    expect.hasAssertions();

    expect(computeStatueLevelEvents("mondstadt", 3, 3)).toStrictEqual([]);
  });

  test("a region with no city in the achievement table emits nothing", () => {
    expect.hasAssertions();

    expect(computeStatueLevelEvents("unmapped-region", 0, 1)).toStrictEqual([]);
  });
});
