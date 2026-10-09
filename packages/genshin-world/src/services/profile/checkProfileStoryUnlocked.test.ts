import type { ProfileStory } from "#src/models/profile/ProfileStory";

import { checkProfileStoryUnlocked } from "#src/services/profile/checkProfileStoryUnlocked";
import { describe, expect, test } from "vitest";

const makeStory = (friendshipLevel: number, hasOtherCondition: boolean): ProfileStory => ({
  friendshipLevel,
  hasOtherCondition,
  text: "",
  title: "",
});

describe(checkProfileStoryUnlocked, () => {
  const LEVEL = 4;

  test("opens a story once the Friendship Level reaches its own, and not before", () => {
    expect.hasAssertions();

    expect(checkProfileStoryUnlocked(makeStory(LEVEL, false), LEVEL - 1)).toBe(false);
    expect(checkProfileStoryUnlocked(makeStory(LEVEL, false), LEVEL)).toBe(true);
  });

  test("opens a story with no level at once", () => {
    expect.hasAssertions();

    expect(checkProfileStoryUnlocked(makeStory(0, false), 0)).toBe(true);
  });

  test("keeps a story locked whatever the level when another condition applies", () => {
    expect.hasAssertions();

    expect(checkProfileStoryUnlocked(makeStory(LEVEL, true), LEVEL + 1)).toBe(false);
  });
});
