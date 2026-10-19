import type { FriendshipLevel } from "#src/models/friendship/FriendshipLevel";

// The Friendship Levels a table holds, at least one, since the top of them is the EXP a Companionship EXP stops at
export type FriendshipLevels = [FriendshipLevel, ...FriendshipLevel[]];
