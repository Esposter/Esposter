import type { FriendshipLevel } from "#src/models/friendship/FriendshipLevel";

// The Friendship Level a character's total Companionship EXP has reached: the number of levels that EXP has got to, each
// Level's EXP being the total to reach it, so level 1 holds from none at all and nothing reads past the top level
export const computeFriendshipLevel = (friendshipExp: number, friendshipLevels: readonly FriendshipLevel[]): number =>
  friendshipLevels.filter((friendshipLevel) => friendshipExp >= friendshipLevel.exp).length;
