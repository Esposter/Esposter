import type { ProfileText } from "#src/models/profile/ProfileText";
import type { GameLanguage } from "genshin-text";

import { computeFriendshipLevel } from "#src/services/friendship/computeFriendshipLevel";
import { FRIENDSHIP_NAMECARD_LEVEL } from "#src/services/friendship/constants";
import { readFriendshipLevels } from "#src/services/friendship/readFriendshipLevels";
import { readFriendshipNamecards } from "#src/services/friendship/readFriendshipNamecards";
import { ProfileTextLoaderMap } from "#src/services/profile/ProfileTextLoaderMap";
import { InvalidOperationError, Operation } from "@esposter/shared";

// A character's profile in the language, the Friendship Level its total Companionship EXP has reached, and the name text id
// Of its namecard, 0 until that level holds it, all read on demand: the profile's chunk of its own, and the friendship slice
export const readCharacterProfile = async (
  avatarId: number,
  language: GameLanguage,
  friendshipExp: number,
): Promise<{ friendshipLevel: number; namecardNameTextId: number; profileText: ProfileText }> => {
  const loadLanguageProfileTexts = ProfileTextLoaderMap.get(avatarId);
  if (!loadLanguageProfileTexts)
    throw new InvalidOperationError(Operation.Read, String(avatarId), "has no profile in genshin-world");

  const [friendshipLevels, namecards, languageProfileTexts] = await Promise.all([
    readFriendshipLevels(),
    readFriendshipNamecards(),
    loadLanguageProfileTexts(),
  ]);
  const friendshipLevel = computeFriendshipLevel(friendshipExp, friendshipLevels);
  const namecard = namecards.find(({ characterId }) => characterId === avatarId);
  return {
    friendshipLevel,
    namecardNameTextId: namecard && friendshipLevel >= FRIENDSHIP_NAMECARD_LEVEL ? namecard.nameTextId : 0,
    profileText: await languageProfileTexts[language](),
  };
};
