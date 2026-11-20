import type { FriendRequestInSocial } from "@esposter/db-schema";

import { getLiveFriendRequestWhere } from "#server/services/friend/getLiveFriendRequestWhere";
import { friendRequestsInSocial } from "@esposter/db-schema";
import { and, eq } from "drizzle-orm";

// A request is named by its friendship, and only the user it was sent to may act on it, so accepting and declining
// Both match on this pair. A request that was declined or accepted is a tombstone, so only a live one matches
export const getReceivedFriendRequestWhere = (
  friendshipId: FriendRequestInSocial["id"],
  receiverId: FriendRequestInSocial["receiverId"],
) => and(getLiveFriendRequestWhere(friendshipId), eq(friendRequestsInSocial.receiverId, receiverId));
