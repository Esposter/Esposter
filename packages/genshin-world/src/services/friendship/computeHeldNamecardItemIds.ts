import type { Character } from "#src/models/character/Character";
import type { FriendshipLevel } from "#src/models/friendship/FriendshipLevel";
import type { FriendshipNamecard } from "#src/models/friendship/FriendshipNamecard";

import { FRIENDSHIP_NAMECARD_LEVEL } from "#src/services/friendship/constants";
import { computeLevelReached } from "#src/services/shared/computeLevelReached";

// The item ids of the namecards the characters' Friendship has opened, a namecard held from the level it is reached at and
// Never stored, so a character's Friendship and the namecards it holds cannot disagree
export const computeHeldNamecardItemIds = (
  namecards: readonly FriendshipNamecard[],
  characters: readonly Pick<Character, "friendshipExp" | "id">[],
  friendshipLevels: readonly FriendshipLevel[],
): number[] => {
  const characterExpMap = new Map(characters.map(({ friendshipExp, id }) => [id, friendshipExp]));
  return namecards
    .filter(
      ({ characterId }) =>
        computeLevelReached(characterExpMap.get(characterId) ?? 0, friendshipLevels) >= FRIENDSHIP_NAMECARD_LEVEL,
    )
    .map(({ itemId }) => itemId);
};
