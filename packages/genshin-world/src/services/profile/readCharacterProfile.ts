import type { ProfileText } from "#src/models/profile/ProfileText";
import type { GameLanguage } from "genshin-text";

import { computeFriendshipLevel } from "#src/services/friendship/computeFriendshipLevel";
import { readFriendshipLevels } from "#src/services/friendship/readFriendshipLevels";
import { ProfileTextLoaderMap } from "#src/services/profile/ProfileTextLoaderMap";
import { InvalidOperationError, Operation } from "@esposter/shared";

// A character's profile in the language, and the Friendship Level its total Companionship EXP has reached, both read on
// Demand: the profile's chunk of its own, and the level table
export const readCharacterProfile = async (
  avatarId: number,
  language: GameLanguage,
  friendshipExp: number,
): Promise<{ friendshipLevel: number; profileText: ProfileText }> => {
  const loadLanguageProfileTexts = ProfileTextLoaderMap.get(avatarId);
  if (!loadLanguageProfileTexts)
    throw new InvalidOperationError(Operation.Read, String(avatarId), "has no profile in genshin-world");

  const [friendshipLevels, languageProfileTexts] = await Promise.all([
    readFriendshipLevels(),
    loadLanguageProfileTexts(),
  ]);
  return {
    friendshipLevel: computeFriendshipLevel(friendshipExp, friendshipLevels),
    profileText: await languageProfileTexts[language](),
  };
};
