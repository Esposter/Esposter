import type { ProfileStory } from "#src/models/profile/ProfileStory";
import type { ProfileText } from "#src/models/profile/ProfileText";

import { getProfileEntries } from "#src/services/profile/getProfileEntries";
import { describe, expect, test } from "vitest";

describe(getProfileEntries, () => {
  const STORY: ProfileStory = { friendshipLevel: 0, hasOtherCondition: false, text: "Story text", title: "Details" };
  const VOICE: ProfileStory = { friendshipLevel: 0, hasOtherCondition: false, text: "Voice text", title: "Greeting" };

  test("the profile tab lists the character's voice-over lines", () => {
    expect.hasAssertions();
    const profileText: ProfileText = { namecardIconName: "", stories: [STORY], voices: [VOICE] };
    expect(getProfileEntries(profileText)).toStrictEqual([STORY, VOICE]);
  });
});
