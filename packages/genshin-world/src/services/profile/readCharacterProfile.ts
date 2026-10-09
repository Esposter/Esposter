import type { ProfileText } from "#src/models/profile/ProfileText";
import type { GameLanguage } from "genshin-text";

import { profileTextSchema } from "#src/models/profile/ProfileText";
import { readGameDataEntry } from "#src/services/data/readGameDataEntry";
import { computeFriendshipLevel } from "#src/services/friendship/computeFriendshipLevel";
import { FRIENDSHIP_NAMECARD_LEVEL } from "#src/services/friendship/constants";
import { readFriendshipLevels } from "#src/services/friendship/readFriendshipLevels";
import { readFriendshipNamecards } from "#src/services/friendship/readFriendshipNamecards";

// A character's profile in the language, the Friendship Level its total Companionship EXP has reached, and the name text id
// Of its namecard, 0 until that level holds it, all read on demand: the profile's record of its own, and the friendship slice
export const readCharacterProfile = async (
  gameDataBaseUrl: string,
  avatarId: number,
  language: GameLanguage,
  friendshipExp: number,
): Promise<{ friendshipLevel: number; namecardNameTextId: number; profileText: ProfileText }> => {
  const [friendshipLevels, namecards, profileText] = await Promise.all([
    readFriendshipLevels(),
    readFriendshipNamecards(),
    readGameDataEntry(gameDataBaseUrl, `profile/${language}`, String(avatarId), profileTextSchema),
  ]);
  const friendshipLevel = computeFriendshipLevel(friendshipExp, friendshipLevels);
  const namecard = namecards.find(({ characterId }) => characterId === avatarId);
  return {
    friendshipLevel,
    namecardNameTextId: namecard && friendshipLevel >= FRIENDSHIP_NAMECARD_LEVEL ? namecard.nameTextId : 0,
    profileText,
  };
};
