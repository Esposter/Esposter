import type { Achievement } from "#src/models/achievement/Achievement";
import type { AchievementCategory } from "#src/models/achievement/AchievementCategory";
import type { AchievementProgress } from "#src/models/achievement/AchievementProgress";
import type { Character } from "#src/models/character/Character";
import type { FriendshipLevel } from "#src/models/friendship/FriendshipLevel";
import type { FriendshipNamecard } from "#src/models/friendship/FriendshipNamecard";

import { computeAchievementNamecardItemIds } from "#src/services/achievement/computeAchievementNamecardItemIds";
import { computeHeldNamecardItemIds } from "#src/services/friendship/computeHeldNamecardItemIds";

// The namecards the profile holds: each character's once its Friendship reaches level 10, then each finished category's.
// Both are read from the Friendship and the achievements each time, so the profile stores neither
export const computeProfileNamecardItemIds = ({
  achievements,
  categories,
  characters,
  friendshipLevels,
  friendshipNamecards,
  progressMap,
}: {
  achievements: readonly Achievement[];
  categories: readonly AchievementCategory[];
  characters: readonly Pick<Character, "friendshipExp" | "id">[];
  friendshipLevels: readonly FriendshipLevel[];
  friendshipNamecards: readonly FriendshipNamecard[];
  progressMap: ReadonlyMap<number, AchievementProgress>;
}): number[] => [
  ...computeHeldNamecardItemIds(friendshipNamecards, characters, friendshipLevels),
  ...computeAchievementNamecardItemIds(categories, achievements, progressMap),
];
