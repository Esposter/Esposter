import type { ProfileStory } from "#src/models/profile/ProfileStory";

import { isProfileStoryUnlocked } from "#src/services/profile/isProfileStoryUnlocked";
import { describe, expect, test } from "vitest";

const makeStory = (friendshipLevel: number, hasOtherCondition: boolean): ProfileStory => ({
  friendshipLevel,
  hasOtherCondition,
  text: "",
  title: "",
});

describe(isProfileStoryUnlocked, () => {
  const LEVEL = 4;

  test("opens a story once the Friendship Level reaches its own, and not before", () => {
    expect.hasAssertions();

    expect(isProfileStoryUnlocked(makeStory(LEVEL, false), LEVEL - 1)).toBe(false);
    expect(isProfileStoryUnlocked(makeStory(LEVEL, false), LEVEL)).toBe(true);
  });

  test("opens a story with no level at once", () => {
    expect.hasAssertions();

    expect(isProfileStoryUnlocked(makeStory(0, false), 0)).toBe(true);
  });

  test("keeps a story locked whatever the level when another condition applies", () => {
    expect.hasAssertions();

    expect(isProfileStoryUnlocked(makeStory(LEVEL, true), LEVEL + 1)).toBe(false);
  });
});
