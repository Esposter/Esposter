import type { ProfileStory } from "#src/models/profile/ProfileStory";

// A story is open once the character's Friendship Level has reached the level it opens at, unless a condition other than a
// Level keeps it locked whatever the level
export const isProfileStoryUnlocked = (profileStory: ProfileStory, friendshipLevel: number): boolean =>
  !profileStory.hasOtherCondition && friendshipLevel >= profileStory.friendshipLevel;
