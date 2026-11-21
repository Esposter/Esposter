import type { FriendRequestInSocial } from "@esposter/db-schema";

import { friendRequestsInSocial, getLiveRowWhere } from "@esposter/db-schema";
import { and, eq } from "drizzle-orm";

// A request is named by its friendship, and a declined or accepted one is a tombstone, so only a live one matches
export const getLiveFriendRequestWhere = (friendshipId: FriendRequestInSocial["id"]) =>
  and(eq(friendRequestsInSocial.id, friendshipId), getLiveRowWhere(friendRequestsInSocial));
