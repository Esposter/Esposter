import { checkIsUnlockedUserAchievement } from "@/services/achievement/checkIsUnlockedUserAchievement";
import { describe, expect, test } from "vitest";

describe(checkIsUnlockedUserAchievement, () => {
  test("is false when the user has no row for the achievement", () => {
    expect.hasAssertions();

    expect(checkIsUnlockedUserAchievement(undefined)).toBe(false);
  });

  // A row with progress but no timestamp is still in progress, so only the stamp decides
  test("is true only once unlockedAt is stamped", () => {
    expect.hasAssertions();

    expect(checkIsUnlockedUserAchievement({ unlockedAt: null })).toBe(false);
    expect(checkIsUnlockedUserAchievement({ unlockedAt: new Date(0) })).toBe(true);
  });
});
