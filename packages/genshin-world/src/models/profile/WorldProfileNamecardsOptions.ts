import type { Achievement } from "#src/models/achievement/Achievement";
import type { AchievementCategory } from "#src/models/achievement/AchievementCategory";
import type { AchievementProgress } from "#src/models/achievement/AchievementProgress";
import type { Character } from "#src/models/character/Character";
import type { FriendshipLevels } from "#src/models/friendship/FriendshipLevels";
import type { FriendshipNamecard } from "#src/models/friendship/FriendshipNamecard";
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { Ref } from "vue";

// What the profile's namecards are read from: the achievements and each category's progress, the characters and the
// Friendship that opens each one's, and the material table and names that name each namecard in the reader's language
export interface WorldProfileNamecardsOptions {
  achievementData: Readonly<Ref<undefined | { achievements: Achievement[]; categories: AchievementCategory[] }>>;
  achievementProgressMap: Readonly<Ref<ReadonlyMap<number, AchievementProgress>>>;
  characters: Readonly<Ref<readonly Pick<Character, "friendshipExp" | "id">[]>>;
  friendshipLevels: Readonly<Ref<FriendshipLevels | undefined>>;
  friendshipNamecards: Readonly<Ref<readonly FriendshipNamecard[]>>;
  materialDataMap: ReadonlyMap<number, MaterialData>;
  nameText: Readonly<Record<string, string>>;
}
