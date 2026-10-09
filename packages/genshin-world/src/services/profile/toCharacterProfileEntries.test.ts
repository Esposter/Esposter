import type { ProfileStory } from "#src/models/profile/ProfileStory";

import { toCharacterProfileEntries } from "#src/services/profile/toCharacterProfileEntries";
import { describe, expect, test } from "vitest";

describe(toCharacterProfileEntries, () => {
  const LEVEL = 2;
  const UNLOCKS_TEXT = "Lv. {0} unlocks: {1}";
  const OPEN_STORY: ProfileStory = { friendshipLevel: 0, hasOtherCondition: false, text: "Text", title: "Details" };
  const LOCKED_STORY: ProfileStory = {
    friendshipLevel: LEVEL,
    hasOtherCondition: false,
    text: "Hidden",
    title: "Story",
  };

  test("lists an open story by its title and text, and a locked one by the unlock line with no text", () => {
    expect.hasAssertions();

    expect(toCharacterProfileEntries([OPEN_STORY, LOCKED_STORY], LEVEL - 1, UNLOCKS_TEXT)).toStrictEqual([
      { isLocked: false, text: "Text", title: "Details" },
      { isLocked: true, text: "", title: "Lv. 2 unlocks: Story" },
    ]);
  });

  test("lists a story that another condition locks by its title alone when no level opens it", () => {
    expect.hasAssertions();

    expect(
      toCharacterProfileEntries(
        [{ friendshipLevel: 0, hasOtherCondition: true, text: "Hidden", title: "Vision" }],
        LEVEL,
        UNLOCKS_TEXT,
      ),
    ).toStrictEqual([{ isLocked: true, text: "", title: "Vision" }]);
  });
});
