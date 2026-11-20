import { getFriendshipId } from "@esposter/shared";

// The key of a pair's row in the friend and request tables: the friendship's natural id, which names the same row from
// Either side of the pair. This is the one place a pair key is built
export const getFriendRowKey = (userId: string, otherUserId: string): [string] => [
  getFriendshipId(userId, otherUserId),
];
