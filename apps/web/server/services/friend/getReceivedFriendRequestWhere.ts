import type { FriendRequestInSocial } from "@esposter/db-schema";

import { friendRequestsInSocial } from "@esposter/db-schema";
import { and, eq } from "drizzle-orm";

// A request is named by its friendship, and only the user it was sent to may act on it, so accepting and declining
// both match on this pair
export const getReceivedFriendRequestWhere = (
  friendshipId: FriendRequestInSocial["id"],
  receiverId: FriendRequestInSocial["receiverId"],
) => and(eq(friendRequestsInSocial.id, friendshipId), eq(friendRequestsInSocial.receiverId, receiverId));
